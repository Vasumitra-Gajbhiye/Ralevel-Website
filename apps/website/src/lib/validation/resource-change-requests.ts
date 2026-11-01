import { z } from "zod";

export const CHANGE_REQUEST_TITLE_MAX = 120;
export const CHANGE_REQUEST_DESCRIPTION_MAX = 2000;
export const CHANGE_REQUEST_NOTE_MAX = 3000;

const trimmed = (max: number) => z.string().trim().max(max);

export const submitChangeRequestSchema = z.object({
  slug: z.string().trim().min(1).max(200),
  title: trimmed(CHANGE_REQUEST_TITLE_MAX).min(1, "Add a short title"),
  description: trimmed(CHANGE_REQUEST_DESCRIPTION_MAX).optional().default(""),
});

/** Request changes and reject: the author needs to know why. */
export const requiredNoteSchema = z.object({
  note: trimmed(CHANGE_REQUEST_NOTE_MAX).min(1, "Add a note for the author"),
});

/** Approve, resubmit and withdraw: a note is optional. */
export const optionalNoteSchema = z.object({
  note: trimmed(CHANGE_REQUEST_NOTE_MAX).optional().default(""),
});

export const approveSchema = optionalNoteSchema.extend({
  /** The proposal the reviewer looked at; approval fails if it has changed. */
  expectedHash: z.string().regex(/^[a-f0-9]{64}$/, "Invalid content hash"),
});

export const commentSchema = z.object({
  body: trimmed(CHANGE_REQUEST_NOTE_MAX).min(1, "Write a comment"),
});

export const listChangeRequestsSchema = z.object({
  tab: z.enum(["needs-review", "open", "closed", "all"]).default("open"),
  mine: z
    .enum(["1", "0", "true", "false"])
    .optional()
    .transform((v) => v === "1" || v === "true"),
  slug: z.string().trim().max(200).optional(),
});

export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid request";
}
