/**
 * Writes for /tasks. Each function loads what it needs, runs the pure
 * permission checks from ./permissions, writes, and logs activity.
 * Server-only.
 */
import connectDB from "@/lib/mongodb";
import { isAdmin, sanitizeRoles } from "@/lib/roles";
import type {
  CertificateMarkInput,
  ListCreateInput,
  ListPatchInput,
  ReviewInput,
  SubmitInput,
  TaskCreateInput,
  TaskPatchInput,
} from "@/lib/validation/tasks";
import Task from "@/models/task";
import TaskComment from "@/models/taskComment";
import TaskList from "@/models/taskList";
import TaskSection from "@/models/taskSection";
import TaskStarCertificate from "@/models/taskStarCertificate";
import UserData from "@/models/userData";
import { isValidObjectId, type Model, type Types } from "mongoose";
import { logActivity, type ActivityEntry } from "./activity";
import { fail, ok, type MutationResult } from "./api";
import { awardStars, departmentStandings, revokeStars } from "./awards";
import { instantFromIst, istTimeOf, istTodayKey } from "./dates";
import {
  notifyApproved,
  notifyCertificateDue,
  notifyChangesRequested,
  notifyReviewRequested,
  notifyTaskAssigned,
} from "./notify";
import {
  canActOnTask,
  canAssign,
  canClaim,
  canComment,
  canCompleteTask,
  canEditSubtask,
  canEditTask,
  canManageList,
  canModerateComment,
  canReview,
  canSubmitForReview,
  canUnclaim,
  canViewList,
  canViewTask,
  needsReview,
  type ListScope,
  type TasksActor,
} from "./permissions";
import {
  firstOccurrence,
  nextDueAfterCompletion,
  normalizeRecurrence,
  type Recurrence,
} from "./recurrence";
import { idOf, listScopeOf, resolveUsers, stripRecurrence, taskScopeOf, type TaskDoc, type TaskListDoc } from "./serialize";
import { crossedMilestone } from "./stars";

type IdResult = MutationResult<{ id: string }>;

const NOT_FOUND = "Not found";
const ORDER_STEP = 1000;

async function loadList(id: string): Promise<TaskListDoc | null> {
  if (!isValidObjectId(id)) return null;
  return TaskList.findById(id).lean<TaskListDoc>();
}

async function loadTask(id: string): Promise<TaskDoc | null> {
  if (!isValidObjectId(id)) return null;
  return Task.findById(id).lean<TaskDoc>();
}

async function nextOrder(model: Model<unknown>, filter: Record<string, unknown>): Promise<number> {
  const last = await model.findOne(filter).sort({ order: -1 }).select("order").lean<{ order?: number }>();
  return (last?.order ?? 0) + ORDER_STEP;
}

function fireAndForget(promise: Promise<unknown>) {
  void promise.catch((error) => console.error("[tasks] notification failed", error));
}

/* ---------------------------------- Inbox --------------------------------- */

/** The user's private inbox list, created on first visit. */
export async function ensureInbox(userId: string): Promise<string> {
  await connectDB();
  const existing = await TaskList.findOne({ kind: "inbox", ownerId: userId }).select("_id").lean<{ _id: Types.ObjectId }>();
  if (existing) return String(existing._id);
  try {
    const created = await TaskList.create({
      kind: "inbox",
      ownerId: userId,
      departmentKey: null,
      name: "Inbox",
      color: "slate",
      createdBy: userId,
    });
    return String(created._id);
  } catch (error) {
    // Two requests raced to create it; the unique index kept one.
    if ((error as { code?: number }).code === 11000) {
      const again = await TaskList.findOne({ kind: "inbox", ownerId: userId }).select("_id").lean<{ _id: Types.ObjectId }>();
      if (again) return String(again._id);
    }
    throw error;
  }
}

/* ---------------------------------- Lists --------------------------------- */

export async function createList(actor: TasksActor, input: ListCreateInput): Promise<IdResult> {
  await connectDB();
  const scope: ListScope = { kind: "department", departmentKey: input.departmentKey, ownerId: null };
  if (!canManageList(actor, scope)) return fail("Only department heads and admins can create lists", 403);

  const created = await TaskList.create({
    kind: "department",
    departmentKey: input.departmentKey,
    ownerId: null,
    name: input.name,
    color: input.color,
    defaultView: input.defaultView,
    order: await nextOrder(TaskList as Model<unknown>, { departmentKey: input.departmentKey }),
    createdBy: actor.id,
    updatedBy: actor.id,
  });
  return ok({ id: String(created._id) });
}

export async function updateList(actor: TasksActor, listId: string, patch: ListPatchInput): Promise<IdResult> {
  await connectDB();
  const list = await loadList(listId);
  if (!list || !canViewList(actor, listScopeOf(list))) return fail(NOT_FOUND, 404);
  if (!canManageList(actor, listScopeOf(list))) return fail("Only department heads and admins can change lists", 403);
  if (list.kind === "inbox" && (patch.name !== undefined || patch.archived !== undefined)) {
    return fail("Your inbox can't be renamed or archived");
  }

  const set: Record<string, unknown> = { updatedBy: actor.id };
  if (patch.name !== undefined) set.name = patch.name;
  if (patch.color !== undefined) set.color = patch.color;
  if (patch.defaultView !== undefined) set.defaultView = patch.defaultView;
  if (patch.archived !== undefined) set.archivedAt = patch.archived ? new Date() : null;
  await TaskList.updateOne({ _id: list._id }, { $set: set });
  return ok({ id: listId });
}

/* -------------------------------- Sections -------------------------------- */

type Failure = { ok: false; status: number; error: string };

async function manageableList(actor: TasksActor, listId: string): Promise<TaskListDoc | Failure> {
  const list = await loadList(listId);
  if (!list || !canViewList(actor, listScopeOf(list))) return fail(NOT_FOUND, 404);
  if (!canManageList(actor, listScopeOf(list))) return fail("Only department heads and admins can change this list", 403);
  return list;
}

const isFailure = (value: unknown): value is Failure =>
  typeof value === "object" && value !== null && (value as { ok?: unknown }).ok === false;

export async function createSection(actor: TasksActor, listId: string, name: string): Promise<IdResult> {
  await connectDB();
  const list = await manageableList(actor, listId);
  if (isFailure(list)) return list;
  const created = await TaskSection.create({
    listId: list._id,
    name,
    order: await nextOrder(TaskSection as Model<unknown>, { listId: list._id }),
  });
  return ok({ id: String(created._id) });
}

async function sectionWithList(actor: TasksActor, sectionId: string) {
  if (!isValidObjectId(sectionId)) return fail(NOT_FOUND, 404);
  const section = await TaskSection.findById(sectionId).lean<{ _id: Types.ObjectId; listId: Types.ObjectId }>();
  if (!section) return fail(NOT_FOUND, 404);
  const list = await manageableList(actor, String(section.listId));
  if (isFailure(list)) return list;
  return { section, list };
}

export async function renameSection(actor: TasksActor, sectionId: string, name: string): Promise<IdResult> {
  await connectDB();
  const found = await sectionWithList(actor, sectionId);
  if (isFailure(found)) return found;
  await TaskSection.updateOne({ _id: found.section._id }, { $set: { name } });
  return ok({ id: sectionId });
}

/** Deletes a section; its tasks move to the top of the list ("No section"). */
export async function deleteSection(actor: TasksActor, sectionId: string): Promise<IdResult> {
  await connectDB();
  const found = await sectionWithList(actor, sectionId);
  if (isFailure(found)) return found;
  await Task.updateMany({ listId: found.list._id, sectionId: found.section._id }, { $set: { sectionId: null } });
  await TaskSection.deleteOne({ _id: found.section._id });
  return ok({ id: sectionId });
}

export async function reorderSections(actor: TasksActor, listId: string, orderedIds: string[]): Promise<IdResult> {
  await connectDB();
  const list = await manageableList(actor, listId);
  if (isFailure(list)) return list;
  const count = await TaskSection.countDocuments({ _id: { $in: orderedIds }, listId: list._id });
  if (count !== new Set(orderedIds).size) return fail("Some sections aren't in this list");
  await TaskSection.bulkWrite(
    orderedIds.map((id, i) => ({
      updateOne: { filter: { _id: id, listId: list._id }, update: { $set: { order: (i + 1) * ORDER_STEP } } },
    })),
  );
  return ok({ id: listId });
}

/* ---------------------------------- Tasks --------------------------------- */

async function assigneeError(actor: TasksActor, scope: ListScope, assigneeId: string): Promise<string | null> {
  if (scope.kind === "inbox") return "Inbox tasks can't be assigned";
  const user = await UserData.findById(assigneeId).select("roles").lean<{ roles?: string[] }>();
  if (!user) return "That person wasn't found";
  if (canAssign(actor, scope, sanitizeRoles(user.roles))) return null;
  return isAdmin(actor.roles) ? "Only current staff can be assigned" : "You can only assign people in this department";
}

type DueFields = { dueOn: string | null; dueAt: Date | null; recurrence: Recurrence | null };

function resolveDue(
  dueOn: string | null,
  dueTime: string | null,
  recurrence: Recurrence | null,
): DueFields | { error: string } {
  if (recurrence && !dueOn) dueOn = firstOccurrence(recurrence, istTodayKey());
  if (dueTime && !dueOn) return { error: "Pick a date to go with the time" };
  return {
    dueOn,
    dueAt: dueOn && dueTime ? instantFromIst(dueOn, dueTime) : null,
    recurrence: recurrence && dueOn ? normalizeRecurrence(recurrence, dueOn) : null,
  };
}

/** Star rewards and claiming only make sense on one-off department tasks. */
function rewardError(input: {
  kind: ListScope["kind"];
  recurrence: Recurrence | null;
  stars: number;
  claimable: boolean;
}): string | null {
  if (!input.stars && !input.claimable) return null;
  if (input.kind === "inbox") return "Inbox tasks can't have a reward or be open for claiming";
  if (input.recurrence) return "Repeating tasks can't have a reward or be open for claiming";
  return null;
}

export async function createTask(actor: TasksActor, input: TaskCreateInput): Promise<IdResult> {
  await connectDB();
  const list = await loadList(input.listId);
  if (!list) return fail(NOT_FOUND, 404);

  // Subtasks: anyone who can act on the parent (its assignee included).
  if (input.parentId) {
    const parent = await loadTask(input.parentId);
    if (!parent || String(parent.listId) !== String(list._id)) return fail(NOT_FOUND, 404);
    const parentScope = taskScopeOf(parent);
    if (!canViewTask(actor, parentScope)) return fail(NOT_FOUND, 404);
    if (parent.parentId) return fail("Subtasks can't have their own subtasks");
    if (!canActOnTask(actor, parentScope)) return fail("Only the assignee or a department head can add subtasks", 403);

    const created = await Task.create({
      listId: parent.listId,
      sectionId: parent.sectionId ?? null,
      parentId: parent._id,
      departmentKey: parent.departmentKey ?? null,
      ownerId: parent.ownerId ?? null,
      title: input.title,
      order: await nextOrder(Task as Model<unknown>, { parentId: parent._id }),
      createdBy: actor.id,
      updatedBy: actor.id,
    });
    return ok({ id: String(created._id) });
  }

  const scope = listScopeOf(list);
  if (!canViewList(actor, scope)) return fail(NOT_FOUND, 404);
  if (!canManageList(actor, scope)) return fail("Only department heads and admins can add tasks here", 403);
  if (list.archivedAt) return fail("This list is archived");

  const sectionId = input.sectionId ?? null;
  if (sectionId && !(await TaskSection.exists({ _id: sectionId, listId: list._id }))) {
    return fail("That section isn't in this list");
  }

  const assigneeId = input.assigneeId ?? null;
  if (assigneeId) {
    const error = await assigneeError(actor, scope, assigneeId);
    if (error) return fail(error, 403);
  }

  const due = resolveDue(input.dueOn ?? null, input.dueTime ?? null, input.recurrence ?? null);
  if ("error" in due) return fail(due.error);

  const stars = input.stars ?? 0;
  const claimable = input.claimable ?? false;
  const rewardProblem = rewardError({ kind: list.kind, recurrence: due.recurrence, stars, claimable });
  if (rewardProblem) return fail(rewardProblem);

  const created = await Task.create({
    listId: list._id,
    sectionId,
    parentId: null,
    departmentKey: list.departmentKey ?? null,
    ownerId: list.ownerId ?? null,
    title: input.title,
    description: input.description ?? "",
    assigneeId,
    ...due,
    priority: input.priority ?? 4,
    claimable,
    stars,
    order: await nextOrder(Task as Model<unknown>, { listId: list._id, sectionId, parentId: null }),
    createdBy: actor.id,
    updatedBy: actor.id,
  });

  await logActivity(created, actor.id, [{ type: "created", data: { title: input.title } }]);
  if (assigneeId) {
    fireAndForget(notifyTaskAssigned({ task: created.toObject(), list, assigneeId, actorId: actor.id }));
  }
  return ok({ id: String(created._id) });
}

const sameRecurrence = (a: Recurrence | null | undefined, b: Recurrence | null | undefined) =>
  JSON.stringify(a ? stripRecurrence(a) : null) === JSON.stringify(b ? stripRecurrence(b) : null);

export async function updateTask(actor: TasksActor, taskId: string, patch: TaskPatchInput): Promise<IdResult> {
  await connectDB();
  const task = await loadTask(taskId);
  if (!task) return fail(NOT_FOUND, 404);

  if (task.parentId) return updateSubtask(actor, task, patch);

  const scope = taskScopeOf(task);
  if (!canViewTask(actor, scope)) return fail(NOT_FOUND, 404);
  if (!canEditTask(actor, scope)) return fail("Only department heads and admins can edit this task", 403);

  const set: Record<string, unknown> = {};
  const entries: ActivityEntry[] = [];

  if (patch.title !== undefined && patch.title !== task.title) {
    set.title = patch.title;
    entries.push({ type: "renamed", data: { from: task.title, to: patch.title } });
  }
  if (patch.description !== undefined && patch.description !== (task.description ?? "")) {
    set.description = patch.description;
    entries.push({ type: "description_changed" });
  }
  if (patch.priority !== undefined && patch.priority !== (task.priority ?? 4)) {
    set.priority = patch.priority;
    entries.push({ type: "priority_changed", data: { from: task.priority ?? 4, to: patch.priority } });
  }

  // Moving to another list: within a department, or from the inbox to a department list.
  const currentList = await loadList(String(task.listId));
  if (!currentList) return fail(NOT_FOUND, 404);
  let target = currentList;
  const moving = patch.listId !== undefined && patch.listId !== String(task.listId);
  if (moving) {
    const next = await loadList(patch.listId!);
    if (!next || !canViewList(actor, listScopeOf(next))) return fail(NOT_FOUND, 404);
    if (!canManageList(actor, listScopeOf(next))) return fail("You can't add tasks to that list", 403);
    if (next.archivedAt) return fail("That list is archived");
    const allowed =
      next.kind === "department" &&
      (currentList.kind === "inbox" || next.departmentKey === currentList.departmentKey);
    if (!allowed) return fail("Tasks can move within a department, or from your inbox to a department list");
    target = next;
    set.listId = next._id;
    set.departmentKey = next.departmentKey ?? null;
    set.ownerId = next.ownerId ?? null;
    set.sectionId = null;
    entries.push({ type: "moved", data: { fromList: currentList.name, toList: next.name } });
  }
  const targetScope = listScopeOf(target);

  if (patch.sectionId !== undefined && (moving || patch.sectionId !== idOf(task.sectionId))) {
    if (patch.sectionId && !(await TaskSection.exists({ _id: patch.sectionId, listId: target._id }))) {
      return fail("That section isn't in this list");
    }
    set.sectionId = patch.sectionId;
  }
  if (set.sectionId !== undefined) {
    set.order = await nextOrder(Task as Model<unknown>, {
      listId: target._id,
      sectionId: set.sectionId,
      parentId: null,
    });
  }

  // Assignee
  const currentAssignee = idOf(task.assigneeId);
  let notifyAssignee: string | null = null;
  if (patch.assigneeId !== undefined && patch.assigneeId !== currentAssignee) {
    if (patch.assigneeId) {
      const error = await assigneeError(actor, targetScope, patch.assigneeId);
      if (error) return fail(error, 403);
      notifyAssignee = patch.assigneeId;
      entries.push({ type: "assigned", data: { from: currentAssignee, to: patch.assigneeId } });
    } else {
      entries.push({ type: "unassigned", data: { from: currentAssignee } });
    }
    set.assigneeId = patch.assigneeId;
  } else if (moving && currentAssignee && (await assigneeError(actor, targetScope, currentAssignee))) {
    set.assigneeId = null;
    entries.push({ type: "unassigned", data: { from: currentAssignee } });
  }
  // A hand-in belongs to whoever made it.
  if (set.assigneeId !== undefined && task.submission && !task.completedAt) set.submission = null;

  // Due date, time and repeat
  if (patch.dueOn !== undefined || patch.dueTime !== undefined || patch.recurrence !== undefined) {
    const clearing = patch.dueOn === null;
    const dueOn = patch.dueOn !== undefined ? patch.dueOn : task.dueOn ?? null;
    const dueTime = clearing
      ? null
      : patch.dueTime !== undefined
        ? patch.dueTime
        : task.dueAt
          ? istTimeOf(new Date(task.dueAt))
          : null;
    const recurrence =
      patch.recurrence !== undefined ? patch.recurrence : clearing ? null : (task.recurrence ?? null);
    const due = resolveDue(dueOn, dueTime, recurrence);
    if ("error" in due) return fail(due.error);

    const oldAt = task.dueAt ? new Date(task.dueAt).getTime() : null;
    if (due.dueOn !== (task.dueOn ?? null) || (due.dueAt?.getTime() ?? null) !== oldAt) {
      entries.push({ type: "due_changed", data: { from: task.dueOn ?? null, to: due.dueOn } });
    }
    if (!sameRecurrence(due.recurrence, task.recurrence)) {
      entries.push({ type: "recurrence_changed", data: { on: Boolean(due.recurrence) } });
    }
    Object.assign(set, due);
  }

  // Reward and claiming
  const stars = patch.stars ?? task.stars ?? 0;
  const claimable = patch.claimable ?? Boolean(task.claimable);
  const recurrence = set.recurrence !== undefined ? (set.recurrence as Recurrence | null) : (task.recurrence ?? null);
  if (stars !== (task.stars ?? 0) || claimable !== Boolean(task.claimable) || set.recurrence !== undefined) {
    const rewardProblem = rewardError({ kind: target.kind, recurrence, stars, claimable });
    if (rewardProblem) return fail(rewardProblem);
  }
  if (stars !== (task.stars ?? 0)) {
    if (task.completedAt) return fail("Reopen the task to change its reward");
    set.stars = stars;
    entries.push({ type: "stars_changed", data: { from: task.stars ?? 0, to: stars } });
    if (!stars && task.submission && !task.completedAt) set.submission = null;
  }
  if (claimable !== Boolean(task.claimable)) {
    set.claimable = claimable;
    entries.push({ type: "claimable_changed", data: { on: claimable } });
  }

  if (!Object.keys(set).length) return ok({ id: taskId });
  set.updatedBy = actor.id;
  await Task.updateOne({ _id: task._id }, { $set: set });
  if (moving) {
    await Task.updateMany(
      { parentId: task._id },
      { $set: { listId: target._id, departmentKey: target.departmentKey ?? null, ownerId: target.ownerId ?? null } },
    );
  }

  await logActivity({ _id: task._id, listId: target._id }, actor.id, entries);
  if (notifyAssignee) {
    fireAndForget(
      notifyTaskAssigned({
        task: { ...task, ...set, _id: task._id } as TaskDoc,
        list: target,
        assigneeId: notifyAssignee,
        actorId: actor.id,
      }),
    );
  }
  return ok({ id: taskId });
}

async function updateSubtask(actor: TasksActor, subtask: TaskDoc, patch: TaskPatchInput): Promise<IdResult> {
  const parent = await loadTask(String(subtask.parentId));
  if (!parent) return fail(NOT_FOUND, 404);
  const scope = taskScopeOf(subtask, idOf(parent.assigneeId));
  if (!canViewTask(actor, scope)) return fail(NOT_FOUND, 404);
  if (Object.keys(patch).some((key) => key !== "title")) return fail("Subtasks only have a title");
  if (!canEditSubtask(actor, scope)) return fail("You can't rename this subtask", 403);
  if (patch.title !== undefined) {
    await Task.updateOne({ _id: subtask._id }, { $set: { title: patch.title, updatedBy: actor.id } });
  }
  return ok({ id: String(subtask._id) });
}

export type CompleteResult = MutationResult<{ id: string; completed: boolean; nextDueOn?: string }>;

export async function setTaskCompleted(actor: TasksActor, taskId: string, completed: boolean): Promise<CompleteResult> {
  await connectDB();
  const task = await loadTask(taskId);
  if (!task) return fail(NOT_FOUND, 404);

  const parent = task.parentId ? await loadTask(String(task.parentId)) : null;
  if (task.parentId && !parent) return fail(NOT_FOUND, 404);
  const scope = taskScopeOf(task, parent ? idOf(parent.assigneeId) : null);
  if (!canViewTask(actor, scope)) return fail(NOT_FOUND, 404);
  if (!canCompleteTask(actor, scope)) return fail(completeDeniedReason(actor, scope), 403);
  if (completed === Boolean(task.completedAt)) return ok({ id: taskId, completed });

  // Reviewed tasks close through approval, which pays the assignee's stars.
  if (needsReview(scope)) return completed ? approveTask(actor, task) : reopenReviewedTask(actor, task);

  const now = new Date();

  if (completed && !task.parentId && task.recurrence && task.dueOn) {
    // Repeating: move to the next occurrence instead of closing the task.
    const nextDueOn = nextDueAfterCompletion(task.recurrence, task.dueOn, istTodayKey(now));
    const dueAt = task.dueAt ? instantFromIst(nextDueOn, istTimeOf(new Date(task.dueAt))) : null;
    await Task.updateOne({ _id: task._id }, { $set: { dueOn: nextDueOn, dueAt, updatedBy: actor.id } });
    await Task.updateMany({ parentId: task._id }, { $set: { completedAt: null, completedBy: null } });
    await logActivity(task, actor.id, [{ type: "occurrence_completed", data: { from: task.dueOn, to: nextDueOn } }]);
    return ok({ id: taskId, completed: false, nextDueOn });
  }

  await Task.updateOne(
    { _id: task._id },
    { $set: completed ? { completedAt: now, completedBy: actor.id } : { completedAt: null, completedBy: null } },
  );
  if (!task.parentId) {
    // Like Todoist, completing a task completes its open subtasks.
    if (completed) {
      await Task.updateMany({ parentId: task._id, completedAt: null }, { $set: { completedAt: now, completedBy: actor.id } });
    }
    await logActivity(task, actor.id, [{ type: completed ? "completed" : "uncompleted" }]);
  }
  return ok({ id: taskId, completed });
}

function completeDeniedReason(actor: TasksActor, scope: ReturnType<typeof taskScopeOf>): string {
  if (!needsReview(scope)) return "Only the assignee or a department head can complete this task";
  if (scope.completed) return "Only department heads can reopen this task";
  if (scope.assigneeId === actor.id) {
    return canEditTask(actor, scope)
      ? "Someone else has to approve your own task"
      : "Submit this task for review instead";
  }
  return "Only department heads can approve this task";
}

/** Completes a reviewed task and pays its stars to the assignee, if it has one. */
async function approveTask(actor: TasksActor, task: TaskDoc): Promise<CompleteResult> {
  const now = new Date();
  const set: Record<string, unknown> = { completedAt: now, completedBy: actor.id, updatedBy: actor.id };
  if (task.submission) set["submission.state"] = "approved";
  const closed = await Task.updateOne({ _id: task._id, completedAt: null }, { $set: set });
  if (!closed.modifiedCount) return ok({ id: String(task._id), completed: true });
  await Task.updateMany({ parentId: task._id, completedAt: null }, { $set: { completedAt: now, completedBy: actor.id } });

  const assigneeId = idOf(task.assigneeId);
  const stars = task.stars ?? 0;
  const paid =
    assigneeId && task.departmentKey
      ? await awardStars({
          taskId: task._id,
          taskTitle: task.title,
          departmentKey: task.departmentKey,
          userId: assigneeId,
          stars,
          awardedBy: actor.id,
        })
      : null;
  await logActivity(task, actor.id, [{ type: "approved", data: { stars: paid ? stars : 0, to: assigneeId } }]);

  if (paid && assigneeId && task.departmentKey) {
    const list = await loadList(String(task.listId));
    if (list) {
      fireAndForget(
        notifyApproved({ task, list, assigneeId, reviewerId: actor.id, stars, before: paid.before, after: paid.after }),
      );
    }
    if (crossedMilestone(paid.before, paid.after)) {
      fireAndForget(
        notifyCertificateDue({ personId: assigneeId, departmentKey: task.departmentKey, totalStars: paid.after }),
      );
    }
  }
  return ok({ id: String(task._id), completed: true });
}

/** Un-completes a reviewed task: its stars are taken back and any hand-in goes back to the queue. */
async function reopenReviewedTask(actor: TasksActor, task: TaskDoc): Promise<CompleteResult> {
  const set: Record<string, unknown> = { completedAt: null, completedBy: null, updatedBy: actor.id };
  if (task.submission) set["submission.state"] = "submitted";
  await Task.updateOne({ _id: task._id }, { $set: set });
  const revoked = await revokeStars(task._id);
  await logActivity(task, actor.id, [{ type: "uncompleted", data: revoked ? { starsRevoked: revoked } : {} }]);
  return ok({ id: String(task._id), completed: false });
}

/* --------------------------- Claiming and review -------------------------- */

async function topLevelTask(actor: TasksActor, taskId: string): Promise<TaskDoc | Failure> {
  const task = await loadTask(taskId);
  if (!task || task.parentId || !canViewTask(actor, taskScopeOf(task))) return fail(NOT_FOUND, 404);
  return task;
}

async function claimedByMessage(taskId: Types.ObjectId): Promise<string> {
  const fresh = await Task.findById(taskId).select("assigneeId").lean<{ assigneeId?: Types.ObjectId | null }>();
  const assigneeId = idOf(fresh?.assigneeId);
  if (!assigneeId) return "This task isn't open for claiming any more";
  const name = (await resolveUsers([assigneeId])).get(assigneeId)?.name;
  return name ? `Already claimed by ${name}` : "Someone already claimed this task";
}

export async function claimTask(actor: TasksActor, taskId: string): Promise<IdResult> {
  await connectDB();
  const task = await topLevelTask(actor, taskId);
  if (isFailure(task)) return task;
  const scope = taskScopeOf(task);
  if (!canClaim(actor, scope)) {
    if (!task.claimable) return fail("This task isn't open for claiming");
    if (task.completedAt) return fail("This task is already done");
    if (task.assigneeId) return fail(await claimedByMessage(task._id), 409);
    return fail("Only members of this department can claim it", 403);
  }

  const claimed = await Task.updateOne(
    { _id: task._id, claimable: true, assigneeId: null, completedAt: null, parentId: null },
    { $set: { assigneeId: actor.id, submission: null, updatedBy: actor.id } },
  );
  if (!claimed.modifiedCount) return fail(await claimedByMessage(task._id), 409);
  await logActivity(task, actor.id, [{ type: "claimed", data: { to: actor.id } }]);
  return ok({ id: taskId });
}

export async function unclaimTask(actor: TasksActor, taskId: string): Promise<IdResult> {
  await connectDB();
  const task = await topLevelTask(actor, taskId);
  if (isFailure(task)) return task;
  if (!canUnclaim(actor, taskScopeOf(task))) {
    return fail(
      task.submission?.state === "submitted" ? "It's waiting for review, so it can't be handed back" : "You haven't claimed this task",
      403,
    );
  }

  const released = await Task.updateOne(
    { _id: task._id, assigneeId: actor.id, completedAt: null, "submission.state": { $ne: "submitted" } },
    { $set: { assigneeId: null, submission: null, updatedBy: actor.id } },
  );
  if (!released.modifiedCount) return fail("This task changed. Refresh and try again", 409);
  await logActivity(task, actor.id, [{ type: "unclaimed", data: { from: actor.id } }]);
  return ok({ id: taskId });
}

export async function submitForReview(actor: TasksActor, taskId: string, input: SubmitInput): Promise<IdResult> {
  await connectDB();
  const task = await topLevelTask(actor, taskId);
  if (isFailure(task)) return task;
  const scope = taskScopeOf(task);
  if (!canSubmitForReview(actor, scope)) {
    if (!needsReview(scope)) return fail("This task doesn't need a review. Just complete it");
    if (task.submission?.state === "submitted") return fail("It's already waiting for review");
    return fail("Only the person doing this task can submit it", 403);
  }

  const link = input.link?.trim() || null;
  const note = input.note?.trim() ?? "";
  const submitted = await Task.updateOne(
    { _id: task._id, assigneeId: actor.id, completedAt: null, "submission.state": { $ne: "submitted" } },
    { $set: { submission: { state: "submitted", at: new Date(), link, note }, updatedBy: actor.id } },
  );
  if (!submitted.modifiedCount) return fail("This task changed. Refresh and try again", 409);
  await logActivity(task, actor.id, [{ type: "submitted", data: link ? { link } : {} }]);

  const list = await loadList(String(task.listId));
  if (list) fireAndForget(notifyReviewRequested({ task, list, submitterId: actor.id, note, link }));
  return ok({ id: taskId });
}

export async function reviewTask(actor: TasksActor, taskId: string, input: ReviewInput): Promise<IdResult> {
  await connectDB();
  const task = await topLevelTask(actor, taskId);
  if (isFailure(task)) return task;
  const scope = taskScopeOf(task);
  if (!canReview(actor, scope)) {
    if (!needsReview(scope)) return fail("This task doesn't have a reward to review");
    if (task.completedAt) return fail("This task is already approved");
    return fail(completeDeniedReason(actor, scope), 403);
  }

  if (input.decision === "approve") {
    if (!task.assigneeId) return fail("Assign this task to someone before approving it");
    const result = await approveTask(actor, task);
    return result.ok ? ok({ id: taskId }) : result;
  }

  if (task.submission?.state !== "submitted") return fail("Nothing has been submitted for review yet");
  const returned = await Task.updateOne(
    { _id: task._id, completedAt: null, "submission.state": "submitted" },
    { $set: { "submission.state": "changes_requested", updatedBy: actor.id } },
  );
  if (!returned.modifiedCount) return fail("This task changed. Refresh and try again", 409);
  await TaskComment.create({ taskId: task._id, authorId: actor.id, body: input.comment });
  await Task.updateOne({ _id: task._id }, { $inc: { commentCount: 1 } });
  await logActivity(task, actor.id, [{ type: "changes_requested" }]);

  const assigneeId = idOf(task.assigneeId);
  const list = await loadList(String(task.listId));
  if (assigneeId && list) {
    fireAndForget(notifyChangesRequested({ task, list, assigneeId, reviewerId: actor.id, comment: input.comment }));
  }
  return ok({ id: taskId });
}

/** Records that an admin issued a certificate for someone's stars. */
export async function markCertificateIssued(actor: TasksActor, input: CertificateMarkInput): Promise<IdResult> {
  await connectDB();
  if (!isAdmin(actor.roles)) return fail("Only owners and admins can issue certificates", 403);
  // Not a membership check: people who have left can still be owed a certificate.
  if (!(await UserData.exists({ _id: input.userId }))) return fail("That person wasn't found", 404);
  const standing = (await departmentStandings(input.departmentKey)).get(input.userId);
  if (!standing?.due) return fail("No certificate is due for this person");

  const created = await TaskStarCertificate.create({
    userId: input.userId,
    departmentKey: input.departmentKey,
    markedBy: actor.id,
    certId: input.certId?.trim() || null,
  });
  return ok({ id: String(created._id) });
}

/** Reorders (and re-sections) top-level tasks: `orderedIds` is the destination's full order. */
export async function moveTasks(
  actor: TasksActor,
  listId: string,
  input: { sectionId: string | null; orderedIds: string[] },
): Promise<IdResult> {
  await connectDB();
  const list = await manageableList(actor, listId);
  if (isFailure(list)) return list;
  if (input.sectionId && !(await TaskSection.exists({ _id: input.sectionId, listId: list._id }))) {
    return fail("That section isn't in this list");
  }
  const ids = [...new Set(input.orderedIds)];
  const count = await Task.countDocuments({ _id: { $in: ids }, listId: list._id, parentId: null });
  if (count !== ids.length) return fail("Some tasks aren't in this list");

  await Task.bulkWrite(
    ids.map((id, i) => ({
      updateOne: {
        filter: { _id: id, listId: list._id, parentId: null },
        update: { $set: { sectionId: input.sectionId, order: (i + 1) * ORDER_STEP } },
      },
    })),
  );
  return ok({ id: listId });
}

export async function deleteTask(actor: TasksActor, taskId: string): Promise<IdResult> {
  await connectDB();
  const task = await loadTask(taskId);
  if (!task) return fail(NOT_FOUND, 404);

  if (task.parentId) {
    const parent = await loadTask(String(task.parentId));
    const scope = taskScopeOf(task, parent ? idOf(parent.assigneeId) : null);
    if (!canViewTask(actor, scope)) return fail(NOT_FOUND, 404);
    if (!canEditSubtask(actor, scope)) return fail("You can't delete this subtask", 403);
    await Task.deleteOne({ _id: task._id });
    return ok({ id: taskId });
  }

  const scope = taskScopeOf(task);
  if (!canViewTask(actor, scope)) return fail(NOT_FOUND, 404);
  if (!canEditTask(actor, scope)) return fail("Only department heads and admins can delete this task", 403);

  const subtaskIds = (await Task.find({ parentId: task._id }).select("_id").lean<{ _id: Types.ObjectId }[]>()).map(
    (s) => s._id,
  );
  const ids = [task._id, ...subtaskIds];
  await Task.deleteMany({ _id: { $in: ids } });
  await TaskComment.deleteMany({ taskId: { $in: ids } });
  await logActivity(task, actor.id, [{ type: "deleted", data: { title: task.title } }]);
  return ok({ id: taskId });
}

/* -------------------------------- Comments -------------------------------- */

type CommentDoc = { _id: Types.ObjectId; taskId: Types.ObjectId; authorId: Types.ObjectId };

export async function addComment(actor: TasksActor, taskId: string, body: string): Promise<IdResult> {
  await connectDB();
  const task = await loadTask(taskId);
  if (!task) return fail(NOT_FOUND, 404);
  if (task.parentId) return fail("Comment on the main task instead");
  const scope = taskScopeOf(task);
  if (!canViewTask(actor, scope)) return fail(NOT_FOUND, 404);
  if (!canComment(actor, scope)) return fail("You can't comment on this task", 403);

  const created = await TaskComment.create({ taskId: task._id, authorId: actor.id, body });
  await Task.updateOne({ _id: task._id }, { $inc: { commentCount: 1 } });
  return ok({ id: String(created._id) });
}

async function commentWithTask(commentId: string) {
  if (!isValidObjectId(commentId)) return null;
  const comment = await TaskComment.findById(commentId).lean<CommentDoc>();
  if (!comment) return null;
  const task = await loadTask(String(comment.taskId));
  return task ? { comment, task } : null;
}

export async function editComment(actor: TasksActor, commentId: string, body: string): Promise<IdResult> {
  await connectDB();
  const found = await commentWithTask(commentId);
  if (!found || !canViewTask(actor, taskScopeOf(found.task))) return fail(NOT_FOUND, 404);
  if (String(found.comment.authorId) !== actor.id) return fail("You can only edit your own comments", 403);
  await TaskComment.updateOne({ _id: found.comment._id }, { $set: { body, editedAt: new Date() } });
  return ok({ id: commentId });
}

export async function deleteComment(actor: TasksActor, commentId: string): Promise<IdResult> {
  await connectDB();
  const found = await commentWithTask(commentId);
  if (!found) return fail(NOT_FOUND, 404);
  const scope = taskScopeOf(found.task);
  if (!canViewTask(actor, scope) && !canEditTask(actor, scope)) return fail(NOT_FOUND, 404);
  if (!canModerateComment(actor, scope, String(found.comment.authorId))) {
    return fail("You can't delete this comment", 403);
  }
  await TaskComment.deleteOne({ _id: found.comment._id });
  await Task.updateOne({ _id: found.task._id, commentCount: { $gt: 0 } }, { $inc: { commentCount: -1 } });
  return ok({ id: commentId });
}
