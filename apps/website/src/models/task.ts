import { DEPARTMENT_KEYS } from "@/lib/tasks/departments";
import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const recurrenceSchema = new mongoose.Schema(
  {
    freq: { type: String, enum: ["day", "week", "month", "year"], required: true },
    interval: { type: Number, default: 1, min: 1, max: 365 },
    weekdays: { type: [Number], default: undefined },
    monthDay: { type: Number, min: 1, max: 31 },
    month: { type: Number, min: 1, max: 12 },
    workdays: { type: Boolean },
  },
  { _id: false },
);

/**
 * A task or (with parentId) a subtask. `departmentKey` and `ownerId` are
 * copied from the list so permission checks and the Today/Upcoming/My Tasks
 * views never need to join lists; moves between lists rewrite them.
 */
const taskSchema = new mongoose.Schema(
  {
    listId: { type: ObjectId, ref: "TaskList", required: true },
    sectionId: { type: ObjectId, ref: "TaskSection", default: null },
    parentId: { type: ObjectId, ref: "Task", default: null },
    departmentKey: { type: String, enum: [...DEPARTMENT_KEYS, null], default: null },
    ownerId: { type: ObjectId, ref: "UserData", default: null },

    title: { type: String, required: true, trim: true, maxlength: 500 },
    description: { type: String, default: "", maxlength: 10_000 },
    assigneeId: { type: ObjectId, ref: "UserData", default: null },
    /** IST calendar day, "YYYY-MM-DD". */
    dueOn: { type: String, default: null, match: /^\d{4}-\d{2}-\d{2}$/ },
    /** Exact instant when a time was set; always on `dueOn` in IST. */
    dueAt: { type: Date, default: null },
    recurrence: { type: recurrenceSchema, default: null },
    priority: { type: Number, enum: [1, 2, 3, 4], default: 4 },

    order: { type: Number, default: 0 },
    completedAt: { type: Date, default: null },
    completedBy: { type: ObjectId, ref: "UserData", default: null },
    commentCount: { type: Number, default: 0 },
    createdBy: { type: ObjectId, ref: "UserData", default: null },
    updatedBy: { type: ObjectId, ref: "UserData", default: null },
  },
  { timestamps: true },
);

taskSchema.index({ assigneeId: 1, completedAt: 1, dueOn: 1 });
taskSchema.index(
  { ownerId: 1, completedAt: 1, dueOn: 1 },
  { partialFilterExpression: { ownerId: { $type: "objectId" } } },
);
taskSchema.index({ listId: 1, completedAt: 1, order: 1 });
taskSchema.index({ parentId: 1, order: 1 });
taskSchema.index({ departmentKey: 1, completedAt: 1, dueOn: 1 });

export default mongoose.models.Task || mongoose.model("Task", taskSchema);
