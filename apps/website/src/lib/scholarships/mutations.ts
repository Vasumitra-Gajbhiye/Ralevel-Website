import connectDB from "@/lib/mongodb";
import {
  firstIssue,
  scholarshipInputSchema,
  scholarshipPublishIssues,
  universityInputSchema,
  type ScholarshipInput,
  type UniversityInput,
} from "@/lib/validation/scholarships";
import Scholarship from "@/models/scholarship";
import ScholarshipSave from "@/models/scholarshipSave";
import University from "@/models/university";
import type { AuthSession } from "@/types/auth";
import mongoose, { type Model } from "mongoose";
import { actorOf, uniqueSlug } from "./adminApi";
import type { ScholarshipSource } from "./constants";
import { todayUtc } from "./format";
import {
  scholarshipDocToInput,
  scholarshipInputToDoc,
  universityInputToDoc,
  type ScholarshipDoc,
} from "./serialize";

export type MutationResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; status: number; error: string };

const fail = (error: string, status = 400): MutationResult => ({ ok: false, status, error });

async function resolveSlug(
  model: Model<unknown>,
  requested: string,
  fallbackText: string,
  id?: string,
): Promise<string | MutationResult> {
  if (!requested) return uniqueSlug(model, "", fallbackText, id);
  const clash = await model.exists({
    slug: requested,
    ...(id ? { _id: { $ne: id } } : {}),
  });
  return clash ? fail(`The slug "${requested}" is already in use`, 409) : requested;
}

/** Publishing counts as a human check, so it clears the verification flag. */
function verificationOnPublish(wasPublished: boolean, nowPublished: boolean) {
  return nowPublished && !wasPublished
    ? { needsVerification: false, lastVerifiedAt: new Date() }
    : {};
}

/* ------------------------------- Scholarships ------------------------------ */

export async function saveScholarship(
  raw: unknown,
  session: AuthSession | null,
  {
    id,
    source = "admin",
    needsVerification,
  }: { id?: string; source?: ScholarshipSource; needsVerification?: boolean } = {},
): Promise<MutationResult> {
  const parsed = scholarshipInputSchema.safeParse(raw);
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const input = parsed.data;

  if (input.status === "published") {
    const issues = scholarshipPublishIssues(input);
    if (issues.length) return fail(`Can't publish yet: ${issues.join("; ")}`);
  }

  await connectDB();
  const model = Scholarship as Model<unknown>;
  const slug = await resolveSlug(model, input.slug, input.title, id);
  if (typeof slug !== "string") return slug;

  const doc = { ...scholarshipInputToDoc(input), slug };
  const actor = session ? actorOf(session) : undefined;

  if (id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return fail("Invalid id");
    const existing = await Scholarship.findById(id).select("status").lean<{ status?: string } | null>();
    if (!existing) return fail("Scholarship not found", 404);

    await Scholarship.updateOne(
      { _id: id },
      {
        $set: {
          ...doc,
          ...verificationOnPublish(existing.status === "published", input.status === "published"),
          ...(actor ? { updatedBy: actor } : {}),
        },
      },
      { runValidators: true },
    );
    return { ok: true, id, slug };
  }

  const created = await Scholarship.create({
    ...doc,
    source,
    needsVerification: needsVerification ?? false,
    ...verificationOnPublish(false, input.status === "published"),
    ...(actor ? { createdBy: actor, updatedBy: actor } : {}),
  });
  return { ok: true, id: String(created._id), slug };
}

export const SCHOLARSHIP_ACTIONS = [
  "verify",
  "rollover",
  "publish",
  "unpublish",
  "archive",
  "duplicate",
] as const;
export type ScholarshipAction = (typeof SCHOLARSHIP_ACTIONS)[number];

function addYears(date: Date | null | undefined, years: number) {
  if (!date) return date ?? null;
  const next = new Date(date);
  next.setUTCFullYear(next.getUTCFullYear() + years);
  return next;
}

export async function applyScholarshipAction(
  id: string,
  action: ScholarshipAction,
  session: AuthSession,
): Promise<MutationResult> {
  if (!mongoose.Types.ObjectId.isValid(id)) return fail("Invalid id");
  await connectDB();

  const doc = await Scholarship.findById(id).lean<ScholarshipDoc | null>();
  if (!doc) return fail("Scholarship not found", 404);

  const updatedBy = actorOf(session);
  const slug = doc.slug ?? "";

  switch (action) {
    case "verify":
      await Scholarship.updateOne(
        { _id: id },
        { $set: { needsVerification: false, lastVerifiedAt: new Date(), updatedBy } },
      );
      return { ok: true, id, slug };

    case "publish": {
      const issues = scholarshipPublishIssues(scholarshipDocToInput(doc));
      if (issues.length) return fail(`Can't publish yet: ${issues.join("; ")}`);
      await Scholarship.updateOne(
        { _id: id },
        {
          $set: {
            status: "published",
            ...verificationOnPublish(doc.status === "published", true),
            updatedBy,
          },
        },
      );
      return { ok: true, id, slug };
    }

    case "unpublish":
    case "archive":
      await Scholarship.updateOne(
        { _id: id },
        { $set: { status: action === "archive" ? "archived" : "draft", updatedBy } },
      );
      return { ok: true, id, slug };

    case "rollover": {
      if (!doc.recurring) return fail("Only recurring scholarships can be rolled over");
      if (!doc.deadline) return fail("Set a deadline before rolling over");
      // Move forward whole years until the deadline is in the future.
      const today = todayUtc();
      let years = 1;
      while ((addYears(doc.deadline, years) as Date) < today) years++;
      await Scholarship.updateOne(
        { _id: id },
        {
          $set: {
            opensAt: addYears(doc.opensAt, years),
            deadline: addYears(doc.deadline, years),
            resultsAt: addYears(doc.resultsAt, years),
            needsVerification: true,
            updatedBy,
          },
        },
      );
      return { ok: true, id, slug };
    }

    case "duplicate": {
      const input = scholarshipDocToInput(doc);
      return saveScholarship(
        {
          ...input,
          slug: "",
          title: `Copy of ${input.title}`.slice(0, 160),
          status: "draft",
          requirements: input.requirements.map(({ label, detail }) => ({ label, detail })),
        },
        session,
        { needsVerification: true },
      );
    }
  }
}

export async function deleteScholarship(id: string): Promise<MutationResult> {
  if (!mongoose.Types.ObjectId.isValid(id)) return fail("Invalid id");
  await connectDB();
  const doc = await Scholarship.findByIdAndDelete(id).select("slug").lean<{ slug?: string } | null>();
  if (!doc) return fail("Scholarship not found", 404);
  await ScholarshipSave.deleteMany({ scholarshipId: id });
  return { ok: true, id, slug: doc.slug ?? "" };
}

/* ------------------------------- Universities ------------------------------ */

export async function saveUniversity(
  raw: unknown,
  session: AuthSession | null,
  {
    id,
    source = "admin",
    needsVerification,
  }: { id?: string; source?: ScholarshipSource; needsVerification?: boolean } = {},
): Promise<MutationResult> {
  const parsed = universityInputSchema.safeParse(raw);
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const input: UniversityInput = parsed.data;

  await connectDB();
  const model = University as Model<unknown>;
  const slug = await resolveSlug(model, input.slug, input.name, id);
  if (typeof slug !== "string") return slug;

  const doc = { ...universityInputToDoc(input), slug };
  const actor = session ? actorOf(session) : undefined;

  if (id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return fail("Invalid id");
    const existing = await University.findById(id).select("status").lean<{ status?: string } | null>();
    if (!existing) return fail("University not found", 404);

    await University.updateOne(
      { _id: id },
      {
        $set: {
          ...doc,
          ...verificationOnPublish(existing.status === "published", input.status === "published"),
          ...(actor ? { updatedBy: actor } : {}),
        },
      },
      { runValidators: true },
    );
    return { ok: true, id, slug };
  }

  const created = await University.create({
    ...doc,
    source,
    needsVerification: needsVerification ?? false,
    ...verificationOnPublish(false, input.status === "published"),
    ...(actor ? { createdBy: actor, updatedBy: actor } : {}),
  });
  return { ok: true, id: String(created._id), slug };
}

export const UNIVERSITY_ACTIONS = ["verify", "publish", "unpublish", "archive"] as const;
export type UniversityAction = (typeof UNIVERSITY_ACTIONS)[number];

export async function applyUniversityAction(
  id: string,
  action: UniversityAction,
  session: AuthSession,
): Promise<MutationResult> {
  if (!mongoose.Types.ObjectId.isValid(id)) return fail("Invalid id");
  await connectDB();
  const doc = await University.findById(id).select("slug status").lean<{
    slug?: string;
    status?: string;
  } | null>();
  if (!doc) return fail("University not found", 404);

  const updatedBy = actorOf(session);
  const set =
    action === "verify"
      ? { needsVerification: false, lastVerifiedAt: new Date() }
      : action === "publish"
        ? { status: "published", ...verificationOnPublish(doc.status === "published", true) }
        : { status: action === "archive" ? "archived" : "draft" };

  await University.updateOne({ _id: id }, { $set: { ...set, updatedBy } });
  return { ok: true, id, slug: doc.slug ?? "" };
}

export async function deleteUniversity(id: string): Promise<MutationResult> {
  if (!mongoose.Types.ObjectId.isValid(id)) return fail("Invalid id");
  await connectDB();
  const doc = await University.findByIdAndDelete(id).select("slug").lean<{ slug?: string } | null>();
  if (!doc) return fail("University not found", 404);
  await Scholarship.updateMany({ universities: id }, { $pull: { universities: id } });
  return { ok: true, id, slug: doc.slug ?? "" };
}

/* --------------------------------- Import ---------------------------------- */

export type ImportResult = { created: number; updated: number; errors: string[] };

/**
 * Upsert by slug. New rows are drafts flagged for verification; existing rows
 * keep their status.
 */
export async function importRows(
  kind: "scholarships" | "universities",
  rows: unknown[],
  session: AuthSession,
): Promise<ImportResult> {
  await connectDB();
  const model = (kind === "scholarships" ? Scholarship : University) as Model<unknown>;
  const save = kind === "scholarships" ? saveScholarship : saveUniversity;
  const result: ImportResult = { created: 0, updated: 0, errors: [] };

  for (const [index, row] of rows.entries()) {
    const slug =
      row && typeof row === "object" && typeof (row as { slug?: unknown }).slug === "string"
        ? (row as { slug: string }).slug
        : "";
    const existing = slug
      ? await model.findOne({ slug }).select("status").lean<{ _id: unknown; status?: string } | null>()
      : null;

    const res = existing
      ? await save({ ...(row as object), status: existing.status ?? "draft" }, session, {
          id: String(existing._id),
        })
      : await save({ ...(row as object), status: "draft" }, session, {
          source: "import",
          needsVerification: true,
        });

    if (!res.ok) result.errors.push(`Row ${index + 1}: ${res.error}`);
    else if (existing) result.updated++;
    else result.created++;
  }

  return result;
}
