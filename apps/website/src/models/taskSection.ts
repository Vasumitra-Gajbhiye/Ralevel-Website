import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const taskSectionSchema = new mongoose.Schema(
  {
    listId: { type: ObjectId, ref: "TaskList", required: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

taskSectionSchema.index({ listId: 1, order: 1 });

export default mongoose.models.TaskSection || mongoose.model("TaskSection", taskSectionSchema);
