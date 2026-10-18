import mongoose from "mongoose";

/** One row per user per IST day the task digest was sent, so reruns never double-send. */
const TaskDigestLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    dayKey: { type: String, required: true },
  },
  { timestamps: true },
);

TaskDigestLogSchema.index({ userId: 1, dayKey: 1 }, { unique: true });
TaskDigestLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export default mongoose.models.TaskDigestLog ||
  mongoose.model("TaskDigestLog", TaskDigestLogSchema);
