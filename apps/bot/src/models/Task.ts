import mongoose from "mongoose";

/** Slim Task schema — same collection as the website, only fields the digest needs. */
const TaskSchema = new mongoose.Schema(
  {
    listId: { type: mongoose.Schema.Types.ObjectId },
    parentId: { type: mongoose.Schema.Types.ObjectId, default: null },
    ownerId: { type: mongoose.Schema.Types.ObjectId, default: null },
    assigneeId: { type: mongoose.Schema.Types.ObjectId, default: null },
    title: { type: String },
    dueOn: { type: String, default: null },
    dueAt: { type: Date, default: null },
    priority: { type: Number, default: 4 },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true, strict: false },
);

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
