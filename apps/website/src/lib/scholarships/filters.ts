import type { StudyPlans } from "@/types/scholarships";
import {
  AID_BASIS,
  AID_POLICIES,
  ANY_COUNTRY,
  CLOSING_SOON_DAYS,
  FIELDS_OF_STUDY,
  FUNDING_TYPES,
  isOneOf,
  PROVIDER_TYPES,
  STUDY_LEVELS,
  type AidBasis,
  type AidPolicy,
  type FieldOfStudy,
  type FundingType,
  type ProviderType,
  type StudyLevel,
} from "./constants";
import { isCountryCode } from "./countries";
import { todayUtc } from "./format";
import { buildMatchConditions, nationalityConditions } from "./match";

type ParamSource =
  | URLSearchParams
  | Record<string, string | string[] | undefined>;

function getParam(source: ParamSource, key: string): string {
  if (source instanceof URLSearchParams) return source.get(key) ?? "";
  const value = source[key];
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function getList<T extends string>(
  source: ParamSource,
  key: string,
  allowed: readonly T[],
): T[] {
  return getParam(source, key)
    .split(",")
    .filter((v): v is T => isOneOf(allowed, v));
}

function getCountries(source: ParamSource, key: string): string[] {
  return getParam(source, key).split(",").filter(isCountryCode);
}

function getFlag(source: ParamSource, key: string): boolean {
  return getParam(source, key) === "1";
}

function getPage(source: ParamSource): number {
  const page = parseInt(getParam(source, "page"), 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function toQueryString(entries: [string, string | string[] | boolean | number][]) {
  const params = new URLSearchParams();
  for (const [key, value] of entries) {
    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(","));
    } else if (typeof value === "boolean") {
      if (value) params.set(key, "1");
    } else if (value !== "" && value !== 0) {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/* ------------------------------- Scholarships ------------------------------ */

export const SCHOLARSHIP_SORTS = ["deadline", "amount", "newest"] as const;
export type ScholarshipSort = (typeof SCHOLARSHIP_SORTS)[number];

export const SCHOLARSHIP_SORT_LABELS: Record<ScholarshipSort, string> = {
  deadline: "Deadline",
  amount: "Amount",
  newest: "Newest",
};

export const SCHOLARSHIP_PAGE_SIZE = 24;

export type ScholarshipFilters = {
  q: string;
  dest: string[];
  level: StudyLevel[];
  funding: FundingType[];
  nat: string;
  field: FieldOfStudy[];
  basis: AidBasis[];
  provider: ProviderType[];
  noEssay: boolean;
  noTest: boolean;
  noInterview: boolean;
  closing: boolean;
  closed: boolean;
  match: boolean;
  sort: ScholarshipSort;
  page: number;
};

export function parseScholarshipFilters(source: ParamSource): ScholarshipFilters {
  const sort = getParam(source, "sort");
  const nat = getParam(source, "nat");
  return {
    q: getParam(source, "q").trim().slice(0, 100),
    dest: getCountries(source, "dest"),
    level: getList(source, "level", STUDY_LEVELS),
    funding: getList(source, "funding", FUNDING_TYPES),
    nat: isCountryCode(nat) ? nat : "",
    field: getList(source, "field", FIELDS_OF_STUDY),
    basis: getList(source, "basis", AID_BASIS),
    provider: getList(source, "provider", PROVIDER_TYPES),
    noEssay: getFlag(source, "noEssay"),
    noTest: getFlag(source, "noTest"),
    noInterview: getFlag(source, "noInterview"),
    closing: getFlag(source, "closing"),
    closed: getFlag(source, "closed"),
    match: getFlag(source, "match"),
    sort: isOneOf(SCHOLARSHIP_SORTS, sort) ? sort : "deadline",
    page: getPage(source),
  };
}

export function scholarshipFiltersToQuery(filters: ScholarshipFilters): string {
  return toQueryString([
    ["q", filters.q],
    ["dest", filters.dest],
    ["level", filters.level],
    ["funding", filters.funding],
    ["nat", filters.nat],
    ["field", filters.field],
    ["basis", filters.basis],
    ["provider", filters.provider],
    ["noEssay", filters.noEssay],
    ["noTest", filters.noTest],
    ["noInterview", filters.noInterview],
    ["closing", filters.closing],
    ["closed", filters.closed],
    ["match", filters.match],
    ["sort", filters.sort === "deadline" ? "" : filters.sort],
    ["page", filters.page > 1 ? filters.page : 0],
  ]);
}

/** Filters that live behind "More filters" — used for its count badge. */
export function countMoreFilters(filters: ScholarshipFilters): number {
  return (
    (filters.nat ? 1 : 0) +
    filters.field.length +
    filters.provider.length +
    (filters.basis.includes("merit") ? 1 : 0) +
    (filters.noTest ? 1 : 0) +
    (filters.noInterview ? 1 : 0) +
    (filters.closed ? 1 : 0)
  );
}

export function hasAnyScholarshipFilter(filters: ScholarshipFilters): boolean {
  const { sort: _sort, page: _page, ...rest } = filters;
  return Object.values(rest).some((v) =>
    Array.isArray(v) ? v.length > 0 : Boolean(v),
  );
}

/** Mongo $match for published scholarships matching the filters. */
export function buildScholarshipMatch(
  filters: ScholarshipFilters,
  { now = new Date(), plans }: { now?: Date; plans?: StudyPlans | null } = {},
): Record<string, unknown> {
  const today = todayUtc(now);
  const and: Record<string, unknown>[] = [{ status: "published" }];

  if (filters.q) and.push({ $text: { $search: filters.q } });
  if (filters.dest.length) {
    and.push({ destinations: { $in: [...filters.dest, ANY_COUNTRY] } });
  }
  if (filters.level.length) and.push({ studyLevels: { $in: filters.level } });
  if (filters.funding.length) and.push({ fundingType: { $in: filters.funding } });
  if (filters.nat) and.push({ $or: nationalityConditions([filters.nat]) });
  if (filters.field.length) {
    and.push({
      $or: [
        { fieldsOfStudy: { $size: 0 } },
        { fieldsOfStudy: { $in: filters.field } },
      ],
    });
  }
  if (filters.basis.length) and.push({ basis: { $in: filters.basis } });
  if (filters.provider.length) and.push({ providerType: { $in: filters.provider } });
  if (filters.noEssay) and.push({ requirementTags: { $ne: "essay" } });
  if (filters.noTest) and.push({ requirementTags: { $ne: "sat_act" } });
  if (filters.noInterview) and.push({ requirementTags: { $ne: "interview" } });

  if (filters.closing) {
    const soon = new Date(today.getTime() + CLOSING_SOON_DAYS * 86_400_000);
    and.push({ deadline: { $gte: today, $lte: soon }, rolling: { $ne: true } });
  } else if (!filters.closed) {
    and.push({
      $or: [
        { deadline: { $gte: today } },
        { deadline: null },
        { rolling: true },
        { opensAt: { $gt: today } },
      ],
    });
  }

  if (filters.match && plans) and.push(...buildMatchConditions(plans));

  return and.length === 1 ? and[0] : { $and: and };
}

/* ------------------------------- Universities ------------------------------ */

export const UNIVERSITY_SORTS = ["aid", "cost", "name"] as const;
export type UniversitySort = (typeof UNIVERSITY_SORTS)[number];

export const UNIVERSITY_SORT_LABELS: Record<UniversitySort, string> = {
  aid: "Average aid",
  cost: "Cost",
  name: "Name",
};

export type UniversityFilters = {
  q: string;
  country: string[];
  policy: AidPolicy[];
  fullNeed: boolean;
  sort: UniversitySort;
  page: number;
};

export function parseUniversityFilters(source: ParamSource): UniversityFilters {
  const sort = getParam(source, "sort");
  return {
    q: getParam(source, "q").trim().slice(0, 100),
    country: getCountries(source, "country"),
    policy: getList(source, "policy", AID_POLICIES),
    fullNeed: getFlag(source, "fullNeed"),
    sort: isOneOf(UNIVERSITY_SORTS, sort) ? sort : "aid",
    page: getPage(source),
  };
}

export function universityFiltersToQuery(filters: UniversityFilters): string {
  return toQueryString([
    ["q", filters.q],
    ["country", filters.country],
    ["policy", filters.policy],
    ["fullNeed", filters.fullNeed],
    ["sort", filters.sort === "aid" ? "" : filters.sort],
    ["page", filters.page > 1 ? filters.page : 0],
  ]);
}

export function buildUniversityMatch(filters: UniversityFilters): Record<string, unknown> {
  const and: Record<string, unknown>[] = [{ status: "published" }];
  if (filters.q) and.push({ $text: { $search: filters.q } });
  if (filters.country.length) and.push({ country: { $in: filters.country } });
  if (filters.policy.length) and.push({ aidPolicy: { $in: filters.policy } });
  if (filters.fullNeed) {
    and.push({ aidPolicy: { $in: ["need_blind_full_need", "need_aware_full_need"] } });
  }
  return and.length === 1 ? and[0] : { $and: and };
}
