import mongoose from "mongoose";

/** Slim TaskList schema — same collection as the website. */
const TaskListSchema = new mongoose.Schema(
  {
    kind: { type: String },
    name: { type: String },
  },
  { timestamps: true, strict: false },
);

export default mongoose.models.TaskList || mongoose.model("TaskList", TaskListSchema);
