import type {
  ScholarshipInput,
  UniversityInput,
} from "@/lib/validation/scholarships";
import type {
  ScholarshipDetail,
  ScholarshipSummary,
  UniversityDetail,
  UniversitySummary,
} from "@/types/scholarships";
import mongoose from "mongoose";
import { fromDateString, toDateString } from "./format";

/* Loose shapes of lean() docs — every field may be missing on old/seeded rows. */

type Id = mongoose.Types.ObjectId | string;

export type ScholarshipDoc = {
  _id: Id;
  slug?: string;
  title?: string;
  provider?: string;
  providerType?: string;
  logo?: string;
  summary?: string;
  description?: string;
  fundingType?: string;
  amountText?: string;
  usdPerYearApprox?: number | null;
  covers?: string[];
  renewable?: boolean;
  durationYears?: number | null;
  studyLevels?: string[];
  destinations?: string[];
  nationality?: { mode?: string; countries?: string[]; note?: string };
  fieldsOfStudy?: string[];
  basis?: string[];
  minGrades?: string;
  otherCriteria?: string[];
  selectionCriteria?: string[];
  requirements?: { _id?: Id; label?: string; detail?: string }[];
  requirementTags?: string[];
  applySteps?: { title?: string; detail?: string }[];
  opensAt?: Date | null;
  deadline?: Date | null;
  deadlineNote?: string;
  resultsAt?: Date | null;
  rolling?: boolean;
  recurring?: boolean;
  applyUrl?: string;
  officialUrl?: string;
  extraLinks?: { label?: string; url?: string }[];
  universities?: (Id | { _id: Id; slug?: string; name?: string })[];
  tags?: string[];
  status?: string;
  needsVerification?: boolean;
  lastVerifiedAt?: Date | null;
  source?: string;
  saveCount?: number;
  updatedAt?: Date;
  createdAt?: Date;
};

export type UniversityDoc = {
  _id: Id;
  slug?: string;
  name?: string;
  country?: string;
  city?: string;
  logo?: string;
  website?: string;
  aidPageUrl?: string;
  netPriceCalculatorUrl?: string;
  aidPolicy?: string;
  aidTypes?: string[];
  noLoans?: boolean;
  requiredForms?: string[];
  testPolicy?: string;
  stats?: {
    intlStudentsAided?: number | null;
    avgAidUsd?: number | null;
    costOfAttendanceUsd?: number | null;
    dataYear?: string;
  };
  deadlines?: { label?: string; date?: Date }[];
  highlights?: string[];
  description?: string;
  status?: string;
  needsVerification?: boolean;
  lastVerifiedAt?: Date | null;
  source?: string;
  updatedAt?: Date;
};

const str = (v: unknown) => (typeof v === "string" ? v : "");
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const strList = (v: unknown) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
// Enum fields are validated on write, so a cast is safe on read.
const enumList = <T extends string>(v: unknown) => strList(v) as T[];

/* ------------------------------- Scholarship ------------------------------- */

export const SCHOLARSHIP_SUMMARY_FIELDS =
  "slug title provider logo fundingType amountText usdPerYearApprox destinations studyLevels deadline opensAt deadlineNote rolling";

export function serializeScholarshipSummary(doc: ScholarshipDoc): ScholarshipSummary {
  return {
    id: String(doc._id),
    slug: str(doc.slug),
    title: str(doc.title),
    provider: str(doc.provider),
    logo: str(doc.logo),
    fundingType: (doc.fundingType ?? "partial") as ScholarshipSummary["fundingType"],
    amountText: str(doc.amountText),
    usdPerYearApprox: num(doc.usdPerYearApprox),
    destinations: strList(doc.destinations),
    studyLevels: enumList(doc.studyLevels),
    deadline: toDateString(doc.deadline),
    opensAt: toDateString(doc.opensAt),
    deadlineNote: str(doc.deadlineNote),
    rolling: Boolean(doc.rolling),
  };
}

export function serializeScholarshipDetail(doc: ScholarshipDoc): ScholarshipDetail {
  return {
    ...serializeScholarshipSummary(doc),
    providerType: (doc.providerType ?? "other") as ScholarshipDetail["providerType"],
    summary: str(doc.summary),
    description: str(doc.description),
    covers: enumList(doc.covers),
    renewable: Boolean(doc.renewable),
    durationYears: num(doc.durationYears),
    nationality: {
      mode: (doc.nationality?.mode ?? "any") as ScholarshipDetail["nationality"]["mode"],
      countries: strList(doc.nationality?.countries),
      note: str(doc.nationality?.note),
    },
    fieldsOfStudy: enumList(doc.fieldsOfStudy),
    basis: enumList(doc.basis),
    minGrades: str(doc.minGrades),
    otherCriteria: strList(doc.otherCriteria),
    selectionCriteria: strList(doc.selectionCriteria),
    requirements: (doc.requirements ?? []).map((r) => ({
      id: String(r._id ?? ""),
      label: str(r.label),
      detail: str(r.detail),
    })),
    requirementTags: enumList(doc.requirementTags),
    applySteps: (doc.applySteps ?? []).map((s) => ({
      title: str(s.title),
      detail: str(s.detail),
    })),
    resultsAt: toDateString(doc.resultsAt),
    recurring: Boolean(doc.recurring),
    applyUrl: str(doc.applyUrl),
    officialUrl: str(doc.officialUrl),
    extraLinks: (doc.extraLinks ?? []).map((l) => ({ label: str(l.label), url: str(l.url) })),
    universities: (doc.universities ?? [])
      .filter((u): u is { _id: Id; slug?: string; name?: string } =>
        typeof u === "object" && u !== null && "slug" in u,
      )
      .map((u) => ({ slug: str(u.slug), name: str(u.name) })),
    lastVerifiedAt: toDateString(doc.lastVerifiedAt),
    status: (doc.status ?? "draft") as ScholarshipDetail["status"],
  };
}

/** DB doc → admin editor values. */
export function scholarshipDocToInput(doc: ScholarshipDoc): ScholarshipInput {
  const detail = serializeScholarshipDetail(doc);
  return {
    slug: detail.slug,
    title: detail.title,
    provider: detail.provider,
    providerType: detail.providerType,
    logo: detail.logo,
    summary: detail.summary,
    description: detail.description,
    fundingType: detail.fundingType,
    amountText: detail.amountText,
    usdPerYearApprox: detail.usdPerYearApprox,
    covers: detail.covers,
    renewable: detail.renewable,
    durationYears: detail.durationYears,
    studyLevels: detail.studyLevels,
    destinations: detail.destinations,
    nationality: detail.nationality,
    fieldsOfStudy: detail.fieldsOfStudy,
    basis: detail.basis,
    minGrades: detail.minGrades,
    otherCriteria: detail.otherCriteria,
    selectionCriteria: detail.selectionCriteria,
    requirements: detail.requirements,
    requirementTags: detail.requirementTags,
    applySteps: detail.applySteps,
    opensAt: detail.opensAt ?? "",
    deadline: detail.deadline ?? "",
    deadlineNote: detail.deadlineNote,
    resultsAt: detail.resultsAt ?? "",
    rolling: detail.rolling,
    recurring: detail.recurring,
    applyUrl: detail.applyUrl,
    officialUrl: detail.officialUrl,
    extraLinks: detail.extraLinks,
    universityIds: (doc.universities ?? []).map((u) =>
      String(typeof u === "object" && u !== null && "_id" in u ? u._id : u),
    ),
    tags: strList(doc.tags),
    status: detail.status,
  };
}

/** Validated editor values → fields to $set on the DB doc. */
export function scholarshipInputToDoc(input: ScholarshipInput) {
  return {
    slug: input.slug,
    title: input.title,
    provider: input.provider,
    providerType: input.providerType,
    logo: input.logo,
    summary: input.summary,
    description: input.description,
    fundingType: input.fundingType,
    amountText: input.amountText,
    usdPerYearApprox: input.usdPerYearApprox ?? undefined,
    covers: input.covers,
    renewable: input.renewable,
    durationYears: input.durationYears ?? undefined,
    studyLevels: input.studyLevels,
    destinations: input.destinations,
    nationality: input.nationality,
    fieldsOfStudy: input.fieldsOfStudy,
    basis: input.basis,
    minGrades: input.minGrades,
    otherCriteria: input.otherCriteria,
    selectionCriteria: input.selectionCriteria,
    // Keep existing _ids so students' ticked requirements survive edits.
    requirements: input.requirements.map((r) => ({
      ...(r.id && mongoose.Types.ObjectId.isValid(r.id) ? { _id: r.id } : {}),
      label: r.label,
      detail: r.detail,
    })),
    requirementTags: input.requirementTags,
    applySteps: input.applySteps,
    opensAt: fromDateString(input.opensAt) ?? null,
    deadline: fromDateString(input.deadline) ?? null,
    deadlineNote: input.deadlineNote,
    resultsAt: fromDateString(input.resultsAt) ?? null,
    rolling: input.rolling,
    recurring: input.recurring,
    applyUrl: input.applyUrl,
    officialUrl: input.officialUrl,
    extraLinks: input.extraLinks,
    universities: input.universityIds,
    tags: [...new Set(input.tags)],
    status: input.status,
  };
}

/* -------------------------------- University ------------------------------- */

export const UNIVERSITY_SUMMARY_FIELDS =
  "slug name country city logo aidPolicy stats.avgAidUsd stats.costOfAttendanceUsd";

export function serializeUniversitySummary(doc: UniversityDoc): UniversitySummary {
  return {
    id: String(doc._id),
    slug: str(doc.slug),
    name: str(doc.name),
    country: str(doc.country),
    city: str(doc.city),
    logo: str(doc.logo),
    aidPolicy: (doc.aidPolicy ?? "limited") as UniversitySummary["aidPolicy"],
    avgAidUsd: num(doc.stats?.avgAidUsd),
    costOfAttendanceUsd: num(doc.stats?.costOfAttendanceUsd),
  };
}

export function serializeUniversityDetail(doc: UniversityDoc): UniversityDetail {
  return {
    ...serializeUniversitySummary(doc),
    website: str(doc.website),
    aidPageUrl: str(doc.aidPageUrl),
    netPriceCalculatorUrl: str(doc.netPriceCalculatorUrl),
    aidTypes: enumList(doc.aidTypes),
    noLoans: Boolean(doc.noLoans),
    requiredForms: enumList(doc.requiredForms),
    testPolicy: (doc.testPolicy ?? "not_applicable") as UniversityDetail["testPolicy"],
    intlStudentsAided: num(doc.stats?.intlStudentsAided),
    dataYear: str(doc.stats?.dataYear),
    deadlines: (doc.deadlines ?? [])
      .map((d) => ({ label: str(d.label), date: toDateString(d.date) ?? "" }))
      .filter((d) => d.date),
    highlights: strList(doc.highlights),
    description: str(doc.description),
    lastVerifiedAt: toDateString(doc.lastVerifiedAt),
    status: (doc.status ?? "draft") as UniversityDetail["status"],
  };
}

export function universityDocToInput(doc: UniversityDoc): UniversityInput {
  const detail = serializeUniversityDetail(doc);
  return {
    slug: detail.slug,
    name: detail.name,
    country: detail.country,
    city: detail.city,
    logo: detail.logo,
    website: detail.website,
    aidPageUrl: detail.aidPageUrl,
    netPriceCalculatorUrl: detail.netPriceCalculatorUrl,
    aidPolicy: detail.aidPolicy,
    aidTypes: detail.aidTypes,
    noLoans: detail.noLoans,
    requiredForms: detail.requiredForms,
    testPolicy: detail.testPolicy,
    stats: {
      intlStudentsAided: detail.intlStudentsAided,
      avgAidUsd: detail.avgAidUsd,
      costOfAttendanceUsd: detail.costOfAttendanceUsd,
      dataYear: detail.dataYear,
    },
    deadlines: detail.deadlines,
    highlights: detail.highlights,
    description: detail.description,
    status: detail.status,
  };
}

export function universityInputToDoc(input: UniversityInput) {
  return {
    ...input,
    stats: {
      intlStudentsAided: input.stats.intlStudentsAided ?? undefined,
      avgAidUsd: input.stats.avgAidUsd ?? undefined,
      costOfAttendanceUsd: input.stats.costOfAttendanceUsd ?? undefined,
      dataYear: input.stats.dataYear,
    },
    deadlines: input.deadlines.map((d) => ({
      label: d.label,
      date: fromDateString(d.date),
    })),
  };
}
