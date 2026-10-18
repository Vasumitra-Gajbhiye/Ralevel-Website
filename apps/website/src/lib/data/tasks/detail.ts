/** Task detail sheet data. Server-only. */
import connectDB from "@/lib/mongodb";
import {
  canActOnTask,
  canEditSubtask,
  canManageList,
  canModerateComment,
  canViewList,
  canViewTask,
  type TasksActor,
} from "@/lib/tasks/permissions";
import {
  idOf,
  listScopeOf,
  resolveUsers,
  taskScopeOf,
  toListRef,
  toSectionDTO,
  toTaskDTO,
  type SectionDoc,
  type TaskDoc,
  type TaskListDoc,
} from "@/lib/tasks/serialize";
import type { TaskDetailDTO } from "@/lib/tasks/types";
import Task from "@/models/task";
import TaskActivity from "@/models/taskActivity";
import TaskComment from "@/models/taskComment";
import TaskList from "@/models/taskList";
import TaskSection from "@/models/taskSection";
import { isValidObjectId, type Types } from "mongoose";

type CommentDoc = { _id: Types.ObjectId; authorId: Types.ObjectId; body: string; createdAt: Date; editedAt?: Date | null };
type ActivityDoc = { _id: Types.ObjectId; actorId: Types.ObjectId; type: string; data?: Record<string, unknown>; createdAt: Date };

const ACTIVITY_LIMIT = 50;

export async function getTaskDetail(actor: TasksActor, taskId: string): Promise<TaskDetailDTO | null> {
  if (!isValidObjectId(taskId)) return null;
  await connectDB();

  let task = await Task.findById(taskId).lean<TaskDoc>();
  // Subtasks open their parent.
  if (task?.parentId) task = await Task.findById(task.parentId).lean<TaskDoc>();
  if (!task || !canViewTask(actor, taskScopeOf(task))) return null;

  const [list, sections, subtasks, comments, activity] = await Promise.all([
    TaskList.findById(task.listId).lean<TaskListDoc>(),
    TaskSection.find({ listId: task.listId }).sort({ order: 1, createdAt: 1 }).lean<SectionDoc[]>(),
    Task.find({ parentId: task._id }).sort({ order: 1, createdAt: 1 }).lean<TaskDoc[]>(),
    TaskComment.find({ taskId: task._id }).sort({ createdAt: 1 }).limit(500).lean<CommentDoc[]>(),
    TaskActivity.find({ taskId: task._id }).sort({ createdAt: -1 }).limit(ACTIVITY_LIMIT).lean<ActivityDoc[]>(),
  ]);
  if (!list) return null;

  const parentAssigneeId = idOf(task.assigneeId);
  const users = await resolveUsers([
    parentAssigneeId,
    ...comments.map((c) => String(c.authorId)),
    ...activity.map((a) => String(a.actorId)),
    ...activity.flatMap((a) => [a.data?.from, a.data?.to].filter((v): v is string => typeof v === "string")),
  ]);
  const scope = taskScopeOf(task);
  const subtaskStats = new Map([
    [String(task._id), { total: subtasks.length, done: subtasks.filter((s) => s.completedAt).length }],
  ]);

  return {
    task: toTaskDTO(task, { actor, users, subtaskStats }),
    list: toListRef(list),
    sections: sections.map(toSectionDTO),
    subtasks: subtasks.map((s) => ({
      ...toTaskDTO(s, { actor, users, parentAssigneeId }),
      canEditTitle: canEditSubtask(actor, taskScopeOf(s, parentAssigneeId)),
    })),
    comments: comments.map((c) => ({
      id: String(c._id),
      author: users.get(String(c.authorId)) ?? null,
      body: c.body,
      createdAt: new Date(c.createdAt).toISOString(),
      editedAt: c.editedAt ? new Date(c.editedAt).toISOString() : null,
      canModerate: canModerateComment(actor, scope, String(c.authorId)),
      isMine: String(c.authorId) === actor.id,
    })),
    activity: activity.map((a) => ({
      id: String(a._id),
      actor: users.get(String(a.actorId)) ?? null,
      type: a.type,
      data: resolveActivityUsers(a.data ?? {}, users),
      createdAt: new Date(a.createdAt).toISOString(),
    })),
    canAddSubtask: canActOnTask(actor, scope),
    canAssign: canManageList(actor, listScopeOf(list)) && list.kind === "department",
    canViewList: canViewList(actor, listScopeOf(list)),
  };
}

/** Swaps user ids in activity data for display names. */
function resolveActivityUsers(data: Record<string, unknown>, users: Map<string, { name: string }>) {
  const out = { ...data };
  for (const key of ["from", "to"] as const) {
    const value = out[key];
    if (typeof value === "string" && users.has(value)) out[`${key}Name`] = users.get(value)!.name;
  }
  return out;
}
