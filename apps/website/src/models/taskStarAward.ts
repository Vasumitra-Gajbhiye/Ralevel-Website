import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

/**
 * Stars someone earned when a head approved their task. A ledger, so stars
 * survive the task being deleted; un-completing the task removes its row.
 */
const taskStarAwardSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "UserData", required: true },
    departmentKey: { type: String, required: true },
    taskId: { type: ObjectId, ref: "Task", required: true },
    taskTitle: { type: String, required: true },
    stars: { type: Number, required: true, min: 1, max: 3 },
    awardedBy: { type: ObjectId, ref: "UserData", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// One award per task, so a double approve can't pay twice.
taskStarAwardSchema.index({ taskId: 1 }, { unique: true });
taskStarAwardSchema.index({ userId: 1, departmentKey: 1 });
taskStarAwardSchema.index({ departmentKey: 1, userId: 1 });

export default mongoose.models.TaskStarAward || mongoose.model("TaskStarAward", taskStarAwardSchema);
