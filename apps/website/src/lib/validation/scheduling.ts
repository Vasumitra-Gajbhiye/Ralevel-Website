import { isValidObjectId } from "mongoose";
import { z } from "zod";

const objectId = z.string().refine((v) => isValidObjectId(v), "Invalid id");

/** Fields the scheduling table is allowed to change on a ScheduleItem. */
export const scheduleItemPatchSchema = z
  .object({
    id: objectId,
    patch: z
      .object({
        event: z.string().max(500),
        date: z.iso.datetime().nullable(),
        ping: z.enum(["yes", "no"]),
        development: z.enum(["awaiting", "in_development", "developed"]),
        sent: z.enum(["awaiting", "sent"]),
        serverEvent: z.enum(["required", "not_required"]),
        status: z.enum(["dormant", "approaching", "ongoing", "concluded"]),
        details: z.string().max(10_000),
      })
      .partial()
      .strict(),
  })
  .strict();

export const scheduleItemDeleteSchema = z.object({ id: objectId }).strict();
