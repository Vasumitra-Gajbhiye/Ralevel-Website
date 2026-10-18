import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const taskCommentSchema = new mongoose.Schema(
  {
    taskId: { type: ObjectId, ref: "Task", required: true },
    authorId: { type: ObjectId, ref: "UserData", required: true },
    body: { type: String, required: true, trim: true, maxlength: 5000 },
    editedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

taskCommentSchema.index({ taskId: 1, createdAt: 1 });

export default mongoose.models.TaskComment || mongoose.model("TaskComment", taskCommentSchema);
