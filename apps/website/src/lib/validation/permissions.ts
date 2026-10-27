import { ADMIN_SECTION_KEYS, type AdminSectionKey } from "@/lib/admin-access/sections";
import { ROLES } from "@/lib/roles";
import { isValidObjectId } from "mongoose";
import { z } from "zod";

const sectionKey = z.enum(ADMIN_SECTION_KEYS as [AdminSectionKey, ...AdminSectionKey[]]);

export const accessChangeSchema = z
  .object({
    section: sectionKey,
    role: z.enum(ROLES),
    granted: z.boolean(),
  })
  .strict();

export const permissionsUpdateSchema = z
  .object({
    /** The version the editor started from; a newer saved version is a conflict. */
    baseVersion: z.number().int().min(0),
    changes: z.array(accessChangeSchema).min(1).max(500),
    note: z.string().trim().max(500).optional(),
  })
  .strict();

export const permissionsHistoryQuerySchema = z.object({
  before: z
    .string()
    .refine((v) => isValidObjectId(v), "Invalid cursor")
    .optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  role: z.enum(ROLES).optional(),
  section: sectionKey.optional(),
});
