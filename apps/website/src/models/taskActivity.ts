import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

export const TASK_ACTIVITY_TYPES = [
  "created",
  "completed",
  "uncompleted",
  "occurrence_completed",
  "renamed",
  "description_changed",
  "due_changed",
  "priority_changed",
  "assigned",
  "unassigned",
  "moved",
  "recurrence_changed",
  "deleted",
] as const;

export type TaskActivityType = (typeof TASK_ACTIVITY_TYPES)[number];

/** History for a task. Kept after the task is deleted (data.title has a snapshot). */
const taskActivitySchema = new mongoose.Schema(
  {
    taskId: { type: ObjectId, ref: "Task", required: true },
    listId: { type: ObjectId, ref: "TaskList", required: true },
    actorId: { type: ObjectId, ref: "UserData", required: true },
    type: { type: String, enum: TASK_ACTIVITY_TYPES, required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

taskActivitySchema.index({ taskId: 1, createdAt: -1 });
taskActivitySchema.index({ listId: 1, createdAt: -1 });

export default mongoose.models.TaskActivity || mongoose.model("TaskActivity", taskActivitySchema);
