/** Mongo docs → client DTOs for /tasks. Server-only. */
import connectDB from "@/lib/mongodb";
import { resolveWriterAvatar } from "@/lib/resolveWriterAvatar";
import UserData from "@/models/userData";
import type { Types } from "mongoose";
import { istTimeOf } from "./dates";
import { permissionsFor, type SubmissionState, type TaskScope, type TasksActor } from "./permissions";
import type { Recurrence } from "./recurrence";
import type { StarCount } from "./stars";
import type { ListKind, ListView, SectionDTO, TaskDTO, TaskListDTO, TaskListRef, UserLite } from "./types";

type Id = Types.ObjectId | string;

export type TaskDoc = {
  _id: Types.ObjectId;
  listId: Types.ObjectId;
  sectionId?: Types.ObjectId | null;
  parentId?: Types.ObjectId | null;
  departmentKey?: string | null;
  ownerId?: Types.ObjectId | null;
  title: string;
  description?: string;
  assigneeId?: Types.ObjectId | null;
  dueOn?: string | null;
  dueAt?: Date | null;
  recurrence?: Recurrence | null;
  priority?: number;
  order?: number;
  completedAt?: Date | null;
  completedBy?: Types.ObjectId | null;
  commentCount?: number;
  createdBy?: Types.ObjectId | null;
  claimable?: boolean;
  stars?: number;
  submission?: { state: SubmissionState; at: Date; link?: string | null; note?: string } | null;
  discordPost?: { channelId: string; messageId: string } | null;
};

export type TaskListDoc = {
  _id: Types.ObjectId;
  kind: ListKind;
  departmentKey?: string | null;
  ownerId?: Types.ObjectId | null;
  name: string;
  color?: string;
  order?: number;
  defaultView?: ListView;
  archivedAt?: Date | null;
};

export type SectionDoc = { _id: Types.ObjectId; listId: Types.ObjectId; name: string; order?: number };

export const idOf = (value: Id | null | undefined): string | null => (value ? String(value) : null);

export function listScopeOf(list: Pick<TaskListDoc, "kind" | "departmentKey" | "ownerId">) {
  return { kind: list.kind, departmentKey: list.departmentKey ?? null, ownerId: idOf(list.ownerId) };
}

/** Permission scope of a task; pass the parent's assignee for subtasks. */
export function taskScopeOf(task: TaskDoc, parentAssigneeId?: string | null): TaskScope {
  return {
    kind: task.ownerId ? "inbox" : "department",
    departmentKey: task.departmentKey ?? null,
    ownerId: idOf(task.ownerId),
    assigneeId: idOf(task.assigneeId),
    createdBy: idOf(task.createdBy),
    parentAssigneeId: parentAssigneeId ?? null,
    isSubtask: Boolean(task.parentId),
    completed: Boolean(task.completedAt),
    claimable: Boolean(task.claimable),
    stars: task.stars ?? 0,
    submissionState: task.submission?.state ?? null,
  };
}

function avatarOf(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    return resolveWriterAvatar(raw);
  } catch {
    return null;
  }
}

/** One query for every user referenced on a page. */
export async function resolveUsers(ids: Iterable<string | null | undefined>): Promise<Map<string, UserLite>> {
  const unique = [...new Set([...ids].filter((id): id is string => Boolean(id)))];
  const map = new Map<string, UserLite>();
  if (!unique.length) return map;
  await connectDB();
  const users = await UserData.find({ _id: { $in: unique } })
    .select("name email nickname writerProfile.avatar")
    .lean<{ _id: Types.ObjectId; name?: string; email: string; nickname?: string; writerProfile?: { avatar?: string } }[]>();
  for (const u of users) {
    map.set(String(u._id), {
      id: String(u._id),
      name: u.name?.trim() || u.nickname || u.email.split("@")[0],
      nickname: u.nickname ?? null,
      avatar: avatarOf(u.writerProfile?.avatar),
    });
  }
  return map;
}

export function toListDTO(list: TaskListDoc, canManage: boolean): TaskListDTO {
  return {
    id: String(list._id),
    kind: list.kind,
    departmentKey: list.departmentKey ?? null,
    name: list.name,
    color: list.color ?? "slate",
    defaultView: list.defaultView ?? "list",
    archived: Boolean(list.archivedAt),
    canManage,
  };
}

export function toListRef(list: TaskListDoc): TaskListRef {
  return {
    id: String(list._id),
    name: list.name,
    color: list.color ?? "slate",
    kind: list.kind,
    departmentKey: list.departmentKey ?? null,
  };
}

export function toSectionDTO(section: SectionDoc): SectionDTO {
  return { id: String(section._id), listId: String(section.listId), name: section.name, order: section.order ?? 0 };
}

export type TaskSerializeContext = {
  actor: TasksActor;
  users: Map<string, UserLite>;
  subtaskStats?: Map<string, { total: number; done: number }>;
  lists?: Map<string, TaskListRef>;
  parentAssigneeId?: string | null;
};

export function toTaskDTO(task: TaskDoc, ctx: TaskSerializeContext): TaskDTO {
  const id = String(task._id);
  const assigneeId = idOf(task.assigneeId);
  const stats = ctx.subtaskStats?.get(id);
  return {
    id,
    listId: String(task.listId),
    sectionId: idOf(task.sectionId),
    parentId: idOf(task.parentId),
    departmentKey: task.departmentKey ?? null,
    title: task.title,
    description: task.description ?? "",
    assignee: assigneeId ? ctx.users.get(assigneeId) ?? null : null,
    dueOn: task.dueOn ?? null,
    dueTime: task.dueAt ? istTimeOf(new Date(task.dueAt)) : null,
    dueAt: task.dueAt ? new Date(task.dueAt).toISOString() : null,
    recurrence: task.recurrence ? stripRecurrence(task.recurrence) : null,
    priority: (task.priority ?? 4) as 1 | 2 | 3 | 4,
    order: task.order ?? 0,
    completedAt: task.completedAt ? new Date(task.completedAt).toISOString() : null,
    commentCount: task.commentCount ?? 0,
    subtaskCount: stats?.total ?? 0,
    subtaskDone: stats?.done ?? 0,
    createdById: idOf(task.createdBy),
    claimable: Boolean(task.claimable),
    stars: (task.stars ?? 0) as StarCount,
    submission: task.submission
      ? {
          state: task.submission.state,
          at: new Date(task.submission.at).toISOString(),
          link: task.submission.link ?? null,
          note: task.submission.note ?? "",
        }
      : null,
    perms: permissionsFor(ctx.actor, taskScopeOf(task, ctx.parentAssigneeId)),
    ...(ctx.lists?.get(String(task.listId)) ? { list: ctx.lists.get(String(task.listId)) } : {}),
  };
}

/** Plain object without mongoose internals or empty fields. */
export function stripRecurrence(rule: Recurrence): Recurrence {
  const out: Recurrence = { freq: rule.freq, interval: rule.interval ?? 1 };
  if (rule.weekdays?.length) out.weekdays = [...rule.weekdays];
  if (rule.monthDay != null) out.monthDay = rule.monthDay;
  if (rule.month != null) out.month = rule.month;
  if (rule.workdays) out.workdays = true;
  return out;
}

/** Collects every user id a set of tasks references. */
export function userIdsOf(tasks: TaskDoc[]): string[] {
  return tasks.map((t) => idOf(t.assigneeId)).filter((id): id is string => Boolean(id));
}
