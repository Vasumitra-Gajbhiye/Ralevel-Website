import connectDB from "@/lib/mongodb";
import {
  buildPaginatedResponse,
  type PaginatedResult,
} from "@/lib/pagination";
import { isOneOf, SCHOLARSHIP_STATUSES, type ScholarshipStatus } from "@/lib/scholarships/constants";
import { todayUtc, toDateString } from "@/lib/scholarships/format";
import {
  scholarshipDocToInput,
  universityDocToInput,
  type ScholarshipDoc,
  type UniversityDoc,
} from "@/lib/scholarships/serialize";
import type { ScholarshipInput, UniversityInput } from "@/lib/validation/scholarships";
import Scholarship from "@/models/scholarship";
import ScholarshipSubmission from "@/models/scholarshipSubmission";
import University from "@/models/university";
import mongoose from "mongoose";

export const ADMIN_PAGE_SIZE = 50;

/** Status tabs in the admin table; "past" and "verify" are the attention links. */
export const ADMIN_VIEWS = ["all", ...SCHOLARSHIP_STATUSES, "past", "verify"] as const;
export type AdminView = (typeof ADMIN_VIEWS)[number];

export function parseAdminView(value: unknown): AdminView {
  return isOneOf(ADMIN_VIEWS, value) ? value : "all";
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function viewFilter(view: AdminView, today: Date): Record<string, unknown> {
  switch (view) {
    case "all":
      return { status: { $ne: "archived" } };
    case "past":
      return { status: "published", rolling: { $ne: true }, deadline: { $lt: today } };
    case "verify":
      return { status: { $ne: "archived" }, needsVerification: true };
    default:
      return { status: view };
  }
}

export type AdminListParams = {
  q: string;
  view: AdminView;
  page: number;
};

/* ------------------------------- Scholarships ------------------------------ */

export type AdminScholarshipRow = {
  id: string;
  slug: string;
  title: string;
  provider: string;
  status: ScholarshipStatus;
  deadline: string | null;
  opensAt: string | null;
  deadlineNote: string;
  rolling: boolean;
  recurring: boolean;
  needsVerification: boolean;
  lastVerifiedAt: string | null;
};

export async function getAdminScholarships({
  q,
  view,
  page,
}: AdminListParams): Promise<PaginatedResult<AdminScholarshipRow>> {
  await connectDB();
  const filter: Record<string, unknown> = viewFilter(view, todayUtc());
  if (q) {
    const pattern = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ title: pattern }, { provider: pattern }, { slug: pattern }];
  }

  const [docs, total] = await Promise.all([
    Scholarship.find(filter)
      .select(
        "slug title provider status deadline opensAt deadlineNote rolling recurring needsVerification lastVerifiedAt",
      )
      .sort({ updatedAt: -1, _id: 1 })
      .skip((page - 1) * ADMIN_PAGE_SIZE)
      .limit(ADMIN_PAGE_SIZE)
      .lean<ScholarshipDoc[]>(),
    Scholarship.countDocuments(filter),
  ]);

  const rows = docs.map((doc) => ({
    id: String(doc._id),
    slug: doc.slug ?? "",
    title: doc.title ?? "",
    provider: doc.provider ?? "",
    status: (doc.status ?? "draft") as ScholarshipStatus,
    deadline: toDateString(doc.deadline),
    opensAt: toDateString(doc.opensAt),
    deadlineNote: doc.deadlineNote ?? "",
    rolling: Boolean(doc.rolling),
    recurring: Boolean(doc.recurring),
    needsVerification: Boolean(doc.needsVerification),
    lastVerifiedAt: toDateString(doc.lastVerifiedAt),
  }));

  return buildPaginatedResponse(rows, total, page, ADMIN_PAGE_SIZE);
}

export type AttentionCounts = {
  past: number;
  verify: number;
  submissions: number;
};

export async function getAttentionCounts(): Promise<AttentionCounts> {
  await connectDB();
  const today = todayUtc();
  const [past, verify, submissions] = await Promise.all([
    Scholarship.countDocuments(viewFilter("past", today)),
    Scholarship.countDocuments(viewFilter("verify", today)),
    ScholarshipSubmission.countDocuments({ status: "pending" }),
  ]);
  return { past, verify, submissions };
}

export type AdminScholarshipMeta = {
  id: string;
  needsVerification: boolean;
  lastVerifiedAt: string | null;
  source: string;
  saveCount: number;
};

export async function getAdminScholarship(
  id: string,
): Promise<{ input: ScholarshipInput; meta: AdminScholarshipMeta } | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  await connectDB();
  const doc = await Scholarship.findById(id).lean<ScholarshipDoc | null>();
  if (!doc) return null;
  return {
    input: scholarshipDocToInput(doc),
    meta: {
      id: String(doc._id),
      needsVerification: Boolean(doc.needsVerification),
      lastVerifiedAt: toDateString(doc.lastVerifiedAt),
      source: doc.source ?? "admin",
      saveCount: doc.saveCount ?? 0,
    },
  };
}

/* ------------------------------- Universities ------------------------------ */

export type AdminUniversityRow = {
  id: string;
  slug: string;
  name: string;
  country: string;
  status: ScholarshipStatus;
  needsVerification: boolean;
  lastVerifiedAt: string | null;
};

export async function getAdminUniversities({
  q,
  view,
  page,
}: AdminListParams): Promise<PaginatedResult<AdminUniversityRow>> {
  await connectDB();
  const filter: Record<string, unknown> =
    view === "past" ? { _id: null } : viewFilter(view, todayUtc());
  if (q) filter.name = new RegExp(escapeRegex(q), "i");

  const [docs, total] = await Promise.all([
    University.find(filter)
      .select("slug name country status needsVerification lastVerifiedAt")
      .sort({ name: 1, _id: 1 })
      .skip((page - 1) * ADMIN_PAGE_SIZE)
      .limit(ADMIN_PAGE_SIZE)
      .lean<UniversityDoc[]>(),
    University.countDocuments(filter),
  ]);

  const rows = docs.map((doc) => ({
    id: String(doc._id),
    slug: doc.slug ?? "",
    name: doc.name ?? "",
    country: doc.country ?? "",
    status: (doc.status ?? "draft") as ScholarshipStatus,
    needsVerification: Boolean(doc.needsVerification),
    lastVerifiedAt: toDateString(doc.lastVerifiedAt),
  }));

  return buildPaginatedResponse(rows, total, page, ADMIN_PAGE_SIZE);
}

export async function getAdminUniversity(
  id: string,
): Promise<{ input: UniversityInput; meta: Omit<AdminScholarshipMeta, "saveCount"> } | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  await connectDB();
  const doc = await University.findById(id).lean<UniversityDoc | null>();
  if (!doc) return null;
  return {
    input: universityDocToInput(doc),
    meta: {
      id: String(doc._id),
      needsVerification: Boolean(doc.needsVerification),
      lastVerifiedAt: toDateString(doc.lastVerifiedAt),
      source: doc.source ?? "admin",
    },
  };
}

export type UniversityOption = { id: string; name: string };

export async function getUniversityOptions(): Promise<UniversityOption[]> {
  await connectDB();
  const docs = await University.find({ status: { $ne: "archived" } })
    .select("name")
    .sort({ name: 1 })
    .lean<UniversityDoc[]>();
  return docs.map((d) => ({ id: String(d._id), name: d.name ?? "" }));
}

/* ------------------------------- Submissions ------------------------------- */

export type AdminSubmission = {
  id: string;
  kind: "new" | "correction";
  title: string;
  url: string;
  deadline: string;
  notes: string;
  submittedBy: string;
  createdAt: string;
  scholarship: { id: string; slug: string; title: string } | null;
};

type SubmissionDoc = {
  _id: mongoose.Types.ObjectId;
  kind: "new" | "correction";
  title?: string;
  url?: string;
  deadline?: string;
  notes?: string;
  submittedBy?: { email?: string };
  createdAt?: Date;
  scholarshipId?: { _id: mongoose.Types.ObjectId; slug?: string; title?: string } | null;
};

export async function getPendingSubmissions(): Promise<AdminSubmission[]> {
  await connectDB();
  const docs = await ScholarshipSubmission.find({ status: "pending" })
    .populate({ path: "scholarshipId", select: "slug title" })
    .sort({ createdAt: 1 })
    .limit(200)
    .lean<SubmissionDoc[]>();

  return docs.map((doc) => ({
    id: String(doc._id),
    kind: doc.kind,
    title: doc.title ?? "",
    url: doc.url ?? "",
    deadline: doc.deadline ?? "",
    notes: doc.notes ?? "",
    submittedBy: doc.submittedBy?.email ?? "",
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : "",
    scholarship: doc.scholarshipId
      ? {
          id: String(doc.scholarshipId._id),
          slug: doc.scholarshipId.slug ?? "",
          title: doc.scholarshipId.title ?? "",
        }
      : null,
  }));
}
