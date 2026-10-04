import { cachedQuery } from "@/lib/data-cache";
import connectDB from "@/lib/mongodb";
import {
  buildScholarshipMatch,
  buildUniversityMatch,
  SCHOLARSHIP_PAGE_SIZE,
  type ScholarshipFilters,
  type UniversityFilters,
} from "@/lib/scholarships/filters";
import { todayUtc } from "@/lib/scholarships/format";
import { buildMatchConditions } from "@/lib/scholarships/match";
import {
  SCHOLARSHIP_SUMMARY_FIELDS,
  serializeScholarshipDetail,
  serializeScholarshipSummary,
  serializeUniversityDetail,
  serializeUniversitySummary,
  UNIVERSITY_SUMMARY_FIELDS,
  type ScholarshipDoc,
  type UniversityDoc,
} from "@/lib/scholarships/serialize";
import Scholarship from "@/models/scholarship";
import University from "@/models/university";
import type {
  ScholarshipDetail,
  ScholarshipSummary,
  StudyPlans,
  UniversityDetail,
  UniversitySummary,
} from "@/types/scholarships";

export const SCHOLARSHIPS_TAG = "scholarships";
export const UNIVERSITIES_TAG = "universities";

const REVALIDATE_SEC = 3600;
const FAR_FUTURE = new Date("9999-12-31T00:00:00Z");

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
};

function projection(fields: string) {
  return Object.fromEntries(fields.split(" ").map((f) => [f, 1]));
}

/* ------------------------------- Scholarships ------------------------------ */

export async function searchScholarships(
  filters: ScholarshipFilters,
  plans: StudyPlans | null,
): Promise<Paginated<ScholarshipSummary>> {
  const key = JSON.stringify({ filters, plans: filters.match ? plans : null });

  return cachedQuery(
    ["scholarships", "search", key],
    async () => {
      await connectDB();
      const today = todayUtc();
      const match = buildScholarshipMatch(filters, { plans });

      const sort: Record<string, 1 | -1> =
        filters.sort === "amount"
          ? { _closed: 1, _amount: -1, _deadline: 1 }
          : filters.sort === "newest"
            ? { createdAt: -1 }
            : { _closed: 1, _deadline: 1, title: 1 };

      const skip = (filters.page - 1) * SCHOLARSHIP_PAGE_SIZE;
      const [result] = await Scholarship.aggregate<{
        items: ScholarshipDoc[];
        total: { n: number }[];
      }>([
        { $match: match },
        {
          $addFields: {
            _deadline: { $ifNull: ["$deadline", FAR_FUTURE] },
            _amount: { $ifNull: ["$usdPerYearApprox", -1] },
            // Closed ones only appear with "show closed" — keep them last.
            _closed: {
              $and: [
                { $ne: ["$rolling", true] },
                { $lt: [{ $ifNull: ["$deadline", FAR_FUTURE] }, today] },
              ],
            },
          },
        },
        { $sort: { ...sort, _id: 1 } },
        {
          $facet: {
            items: [
              { $skip: skip },
              { $limit: SCHOLARSHIP_PAGE_SIZE },
              { $project: projection(SCHOLARSHIP_SUMMARY_FIELDS) },
            ],
            total: [{ $count: "n" }],
          },
        },
      ]);

      const total = result?.total[0]?.n ?? 0;
      return {
        items: (result?.items ?? []).map(serializeScholarshipSummary),
        total,
        page: filters.page,
        totalPages: Math.ceil(total / SCHOLARSHIP_PAGE_SIZE),
      };
    },
    { revalidate: REVALIDATE_SEC, tags: [SCHOLARSHIPS_TAG] },
  );
}

/** How many open, published scholarships fit the student's study plans. */
export async function countProfileMatches(plans: StudyPlans): Promise<number> {
  return cachedQuery(
    ["scholarships", "match-count", JSON.stringify(plans)],
    async () => {
      await connectDB();
      const today = todayUtc();
      return Scholarship.countDocuments({
        $and: [
          { status: "published" },
          {
            $or: [
              { deadline: { $gte: today } },
              { deadline: null },
              { rolling: true },
              { opensAt: { $gt: today } },
            ],
          },
          ...buildMatchConditions(plans),
        ],
      });
    },
    { revalidate: REVALIDATE_SEC, tags: [SCHOLARSHIPS_TAG] },
  );
}

async function loadScholarship(filter: Record<string, unknown>) {
  await connectDB();
  const doc = await Scholarship.findOne(filter)
    .populate({ path: "universities", select: "slug name status", match: { status: "published" } })
    .lean<ScholarshipDoc | null>();
  return doc ? serializeScholarshipDetail(doc) : null;
}

export async function getPublishedScholarship(slug: string): Promise<ScholarshipDetail | null> {
  return cachedQuery(
    ["scholarships", "detail", slug],
    () => loadScholarship({ slug, status: "published" }),
    { revalidate: REVALIDATE_SEC, tags: [SCHOLARSHIPS_TAG] },
  );
}

/** Uncached, any status — for staff previews of drafts. */
export async function getScholarshipForPreview(slug: string) {
  return loadScholarship({ slug });
}

export async function getScholarshipsForUniversity(
  universityId: string,
): Promise<ScholarshipSummary[]> {
  return cachedQuery(
    ["scholarships", "by-university", universityId],
    async () => {
      await connectDB();
      const docs = await Scholarship.find({ status: "published", universities: universityId })
        .select(SCHOLARSHIP_SUMMARY_FIELDS)
        .sort({ deadline: 1 })
        .limit(50)
        .lean<ScholarshipDoc[]>();
      return docs.map(serializeScholarshipSummary);
    },
    { revalidate: REVALIDATE_SEC, tags: [SCHOLARSHIPS_TAG] },
  );
}

/* ------------------------------- Universities ------------------------------ */

export const UNIVERSITY_PAGE_SIZE = 30;

export async function searchUniversities(
  filters: UniversityFilters,
): Promise<Paginated<UniversitySummary>> {
  return cachedQuery(
    ["universities", "search", JSON.stringify(filters)],
    async () => {
      await connectDB();
      const match = buildUniversityMatch(filters);
      const sort: Record<string, 1 | -1> =
        filters.sort === "cost"
          ? { _cost: 1, name: 1 }
          : filters.sort === "name"
            ? { name: 1 }
            : { _aid: -1, name: 1 };

      const skip = (filters.page - 1) * UNIVERSITY_PAGE_SIZE;
      const [result] = await University.aggregate<{
        items: UniversityDoc[];
        total: { n: number }[];
      }>([
        { $match: match },
        {
          $addFields: {
            _aid: { $ifNull: ["$stats.avgAidUsd", -1] },
            _cost: { $ifNull: ["$stats.costOfAttendanceUsd", Number.MAX_SAFE_INTEGER] },
          },
        },
        { $sort: { ...sort, _id: 1 } },
        {
          $facet: {
            items: [
              { $skip: skip },
              { $limit: UNIVERSITY_PAGE_SIZE },
              { $project: projection(UNIVERSITY_SUMMARY_FIELDS) },
            ],
            total: [{ $count: "n" }],
          },
        },
      ]);

      const total = result?.total[0]?.n ?? 0;
      return {
        items: (result?.items ?? []).map(serializeUniversitySummary),
        total,
        page: filters.page,
        totalPages: Math.ceil(total / UNIVERSITY_PAGE_SIZE),
      };
    },
    { revalidate: REVALIDATE_SEC, tags: [UNIVERSITIES_TAG] },
  );
}

async function loadUniversity(filter: Record<string, unknown>) {
  await connectDB();
  const doc = await University.findOne(filter).lean<UniversityDoc | null>();
  return doc ? serializeUniversityDetail(doc) : null;
}

export async function getPublishedUniversity(slug: string): Promise<UniversityDetail | null> {
  return cachedQuery(
    ["universities", "detail", slug],
    () => loadUniversity({ slug, status: "published" }),
    { revalidate: REVALIDATE_SEC, tags: [UNIVERSITIES_TAG] },
  );
}

export async function getUniversityForPreview(slug: string) {
  return loadUniversity({ slug });
}

/** Countries that have at least one published university (for the filter). */
export async function getUniversityCountries(): Promise<string[]> {
  return cachedQuery(
    ["universities", "countries"],
    async () => {
      await connectDB();
      const codes = await University.distinct("country", { status: "published" });
      return (codes as string[]).sort();
    },
    { revalidate: REVALIDATE_SEC, tags: [UNIVERSITIES_TAG] },
  );
}
