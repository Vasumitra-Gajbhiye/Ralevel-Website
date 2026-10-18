import connectDB from "@/lib/mongodb";
import { canViewTask, type TasksActor } from "@/lib/tasks/permissions";
import {
  resolveUsers,
  taskScopeOf,
  toListRef,
  toTaskDTO,
  userIdsOf,
  type TaskDoc,
  type TaskListDoc,
} from "@/lib/tasks/serialize";
import type { TaskDTO, TaskListRef } from "@/lib/tasks/types";
import Task from "@/models/task";
import TaskList from "@/models/taskList";
import type { Types } from "mongoose";

/** Subtask totals per parent id. */
export async function subtaskStatsFor(parentIds: Types.ObjectId[]) {
  const stats = new Map<string, { total: number; done: number }>();
  if (!parentIds.length) return stats;
  const rows = await Task.aggregate<{ _id: Types.ObjectId; total: number; done: number }>([
    { $match: { parentId: { $in: parentIds } } },
    {
      $group: {
        _id: "$parentId",
        total: { $sum: 1 },
        done: { $sum: { $cond: [{ $ne: ["$completedAt", null] }, 1, 0] } },
      },
    },
  ]);
  for (const row of rows) stats.set(String(row._id), { total: row.total, done: row.done });
  return stats;
}

/** Sort for date-driven views: due day, then time, then priority, then manual order. */
export function byDue(a: TaskDTO, b: TaskDTO): number {
  if (a.dueOn !== b.dueOn) {
    if (!a.dueOn) return 1;
    if (!b.dueOn) return -1;
    return a.dueOn < b.dueOn ? -1 : 1;
  }
  if (a.dueAt !== b.dueAt) {
    if (!a.dueAt) return 1;
    if (!b.dueAt) return -1;
    return a.dueAt < b.dueAt ? -1 : 1;
  }
  return a.priority - b.priority || a.order - b.order;
}

/** Serialises top-level tasks from several lists, dropping any the actor can't see. */
export async function serializeCrossListTasks(actor: TasksActor, docs: TaskDoc[]): Promise<TaskDTO[]> {
  await connectDB();
  const visible = docs.filter((t) => canViewTask(actor, taskScopeOf(t)));
  const listIds = [...new Set(visible.map((t) => String(t.listId)))];
  const [lists, users, subtaskStats] = await Promise.all([
    TaskList.find({ _id: { $in: listIds } }).lean<TaskListDoc[]>(),
    resolveUsers(userIdsOf(visible)),
    subtaskStatsFor(visible.map((t) => t._id)),
  ]);
  const listRefs = new Map<string, TaskListRef>(lists.map((l) => [String(l._id), toListRef(l)]));
  return visible
    .filter((t) => listRefs.has(String(t.listId)))
    .map((t) => toTaskDTO(t, { actor, users, subtaskStats, lists: listRefs }))
    .sort(byDue);
}
