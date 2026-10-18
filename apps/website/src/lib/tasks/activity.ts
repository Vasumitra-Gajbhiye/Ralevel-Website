/** Task history rows. Server-only. */
import TaskActivity, { type TaskActivityType } from "@/models/taskActivity";
import type { Types } from "mongoose";

type Id = Types.ObjectId | string;

export type ActivityEntry = { type: TaskActivityType; data?: Record<string, unknown> };

export async function logActivity(
  task: { _id: Id; listId: Id },
  actorId: string,
  entries: ActivityEntry[],
): Promise<void> {
  if (!entries.length) return;
  try {
    await TaskActivity.insertMany(
      entries.map((e) => ({ taskId: task._id, listId: task.listId, actorId, type: e.type, data: e.data ?? {} })),
    );
  } catch (error) {
    // History is best-effort: never fail the user's change over it.
    console.error("[tasks] activity log failed", error);
  }
}
