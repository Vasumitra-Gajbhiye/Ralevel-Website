import { TASK_COLOR_KEYS } from "@/lib/tasks/colors";
import { isDayKey } from "@/lib/tasks/dates";
import { DEPARTMENT_KEYS } from "@/lib/tasks/departments";
import { isValidObjectId } from "mongoose";
import { z } from "zod";

export { firstIssue } from "@/lib/validation/scholarships";

export const objectId = z.string().refine((v) => isValidObjectId(v), "Invalid id");

const dayKey = z.string().refine(isDayKey, "Use a YYYY-MM-DD date");
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm");
const name = z.string().trim().min(1, "Name is required").max(80);

export const recurrenceSchema = z
  .object({
    freq: z.enum(["day", "week", "month", "year"]),
    interval: z.number().int().min(1).max(365).default(1),
    weekdays: z.array(z.number().int().min(0).max(6)).max(7).optional(),
    monthDay: z.number().int().min(1).max(31).optional(),
    month: z.number().int().min(1).max(12).optional(),
    workdays: z.boolean().optional(),
  })
  .strict();

const priority = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);

export const listCreateSchema = z
  .object({
    departmentKey: z.enum(DEPARTMENT_KEYS as [string, ...string[]]),
    name,
    color: z.enum(TASK_COLOR_KEYS as [string, ...string[]]).default("slate"),
    defaultView: z.enum(["list", "board"]).default("list"),
  })
  .strict();

export const listPatchSchema = z
  .object({
    name: name.optional(),
    color: z.enum(TASK_COLOR_KEYS as [string, ...string[]]).optional(),
    defaultView: z.enum(["list", "board"]).optional(),
    archived: z.boolean().optional(),
  })
  .strict();

export const sectionCreateSchema = z.object({ name }).strict();
export const sectionPatchSchema = z.object({ name }).strict();
export const orderedIdsSchema = z.object({ orderedIds: z.array(objectId).max(500) }).strict();

export const moveSchema = z
  .object({
    sectionId: objectId.nullable(),
    orderedIds: z.array(objectId).min(1).max(1000),
  })
  .strict();

const taskFields = {
  title: z.string().trim().min(1, "Title is required").max(500),
  description: z.string().max(10_000),
  assigneeId: objectId.nullable(),
  dueOn: dayKey.nullable(),
  dueTime: time.nullable(),
  recurrence: recurrenceSchema.nullable(),
  priority,
  sectionId: objectId.nullable(),
};

export const taskCreateSchema = z
  .object({
    listId: objectId,
    parentId: objectId.nullable().optional(),
    title: taskFields.title,
    description: taskFields.description.optional(),
    assigneeId: taskFields.assigneeId.optional(),
    dueOn: taskFields.dueOn.optional(),
    dueTime: taskFields.dueTime.optional(),
    recurrence: taskFields.recurrence.optional(),
    priority: priority.optional(),
    sectionId: taskFields.sectionId.optional(),
  })
  .strict();

export const taskPatchSchema = z
  .object({
    title: taskFields.title.optional(),
    description: taskFields.description.optional(),
    assigneeId: taskFields.assigneeId.optional(),
    dueOn: taskFields.dueOn.optional(),
    dueTime: taskFields.dueTime.optional(),
    recurrence: taskFields.recurrence.optional(),
    priority: priority.optional(),
    sectionId: taskFields.sectionId.optional(),
    listId: objectId.optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, "Nothing to update");

export const completeSchema = z.object({ completed: z.boolean() }).strict();

export const commentSchema = z
  .object({ body: z.string().trim().min(1, "Write something first").max(5000) })
  .strict();

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskPatchInput = z.infer<typeof taskPatchSchema>;
export type ListCreateInput = z.infer<typeof listCreateSchema>;
export type ListPatchInput = z.infer<typeof listPatchSchema>;
