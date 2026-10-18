import { TASK_COLOR_KEYS } from "@/lib/tasks/colors";
import { DEPARTMENT_KEYS } from "@/lib/tasks/departments";
import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

/** A /tasks list (Todoist "project"): a department list or someone's private inbox. */
const taskListSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ["inbox", "department"], required: true },
    departmentKey: { type: String, enum: [...DEPARTMENT_KEYS, null], default: null },
    ownerId: { type: ObjectId, ref: "UserData", default: null },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    color: { type: String, enum: TASK_COLOR_KEYS, default: "slate" },
    order: { type: Number, default: 0 },
    defaultView: { type: String, enum: ["list", "board"], default: "list" },
    archivedAt: { type: Date, default: null },
    createdBy: { type: ObjectId, ref: "UserData", default: null },
    updatedBy: { type: ObjectId, ref: "UserData", default: null },
  },
  { timestamps: true },
);

taskListSchema.index({ departmentKey: 1, archivedAt: 1, order: 1 });
taskListSchema.index(
  { ownerId: 1 },
  { unique: true, partialFilterExpression: { kind: "inbox" } },
);

export default mongoose.models.TaskList || mongoose.model("TaskList", taskListSchema);
