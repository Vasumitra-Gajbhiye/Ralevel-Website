import {
  AID_BASIS,
  AID_FORMS,
  AID_POLICIES,
  ANY_COUNTRY,
  COVERS,
  FIELDS_OF_STUDY,
  FUNDING_TYPES,
  NATIONALITY_MODES,
  PROVIDER_TYPES,
  REQUIREMENT_TAGS,
  RESERVED_SCHOLARSHIP_SLUGS,
  SCHOLARSHIP_STATUSES,
  STUDY_LEVELS,
  TEST_POLICIES,
} from "@/lib/scholarships/constants";
import { isCountryCode } from "@/lib/scholarships/countries";
import { z } from "zod";

/* --------------------------------- Helpers --------------------------------- */

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** "YYYY-MM-DD" that parses to a real calendar date. */
export function isDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i;

const text = (max: number) => z.string().trim().max(max);
const requiredText = (max: number, label: string) =>
  z.string().trim().min(1, `${label} is required`).max(max);
const lines = (maxItems: number, maxLength = 300) =>
  z.array(z.string().trim().min(1).max(maxLength)).max(maxItems);

const optionalUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === "" || isHttpUrl(v), "Must be a valid http(s) link");

const optionalDate = z
  .string()
  .trim()
  .refine((v) => v === "" || isDateString(v), "Must be a date (YYYY-MM-DD)");

const slug = z
  .string()
  .trim()
  .max(80)
  .refine((v) => v === "" || SLUG_PATTERN.test(v), "Use lowercase letters, numbers and dashes")
  .refine(
    (v) => !(RESERVED_SCHOLARSHIP_SLUGS as readonly string[]).includes(v),
    "This slug is reserved",
  );

const countryCode = z.string().refine(isCountryCode, "Unknown country");
const destinationCode = z
  .string()
  .refine((v) => v === ANY_COUNTRY || isCountryCode(v), "Unknown country");
const objectId = z.string().regex(OBJECT_ID_PATTERN, "Invalid id");
const nullableInt = (max: number) => z.number().int().min(0).max(max).nullable();

/* ------------------------------- Scholarship ------------------------------- */

export const scholarshipInputSchema = z.object({
  slug,
  title: requiredText(160, "Title"),
  provider: requiredText(160, "Provider"),
  providerType: z.enum(PROVIDER_TYPES),
  logo: text(300),
  summary: text(280),
  description: text(10000),

  fundingType: z.enum(FUNDING_TYPES),
  amountText: text(120),
  usdPerYearApprox: nullableInt(1_000_000),
  covers: z.array(z.enum(COVERS)),
  renewable: z.boolean(),
  durationYears: z.number().int().min(1).max(10).nullable(),

  studyLevels: z.array(z.enum(STUDY_LEVELS)),
  destinations: z.array(destinationCode).max(60),

  nationality: z.object({
    mode: z.enum(NATIONALITY_MODES),
    countries: z.array(countryCode).max(250),
    note: text(300),
  }),
  fieldsOfStudy: z.array(z.enum(FIELDS_OF_STUDY)),
  basis: z.array(z.enum(AID_BASIS)),
  minGrades: text(60),
  otherCriteria: lines(20),
  selectionCriteria: lines(20),

  requirements: z
    .array(
      z.object({
        id: z.string().optional(),
        label: requiredText(200, "Requirement"),
        detail: text(500),
      }),
    )
    .max(30),
  requirementTags: z.array(z.enum(REQUIREMENT_TAGS)),
  applySteps: z
    .array(
      z.object({
        title: requiredText(200, "Step"),
        detail: text(500),
      }),
    )
    .max(20),

  opensAt: optionalDate,
  deadline: optionalDate,
  deadlineNote: text(160),
  resultsAt: optionalDate,
  rolling: z.boolean(),
  recurring: z.boolean(),

  applyUrl: optionalUrl,
  officialUrl: optionalUrl,
  extraLinks: z
    .array(
      z.object({
        label: requiredText(80, "Link label"),
        url: optionalUrl.refine((v) => v !== "", "Link is required"),
      }),
    )
    .max(10),
  universityIds: z.array(objectId).max(50),

  tags: z.array(z.string().trim().toLowerCase().min(1).max(40)).max(15),
  status: z.enum(SCHOLARSHIP_STATUSES),
});

export type ScholarshipInput = z.infer<typeof scholarshipInputSchema>;

export function emptyScholarshipInput(): ScholarshipInput {
  return {
    slug: "",
    title: "",
    provider: "",
    providerType: "university",
    logo: "",
    summary: "",
    description: "",
    fundingType: "full",
    amountText: "",
    usdPerYearApprox: null,
    covers: [],
    renewable: false,
    durationYears: null,
    studyLevels: ["undergraduate"],
    destinations: [],
    nationality: { mode: "any", countries: [], note: "" },
    fieldsOfStudy: [],
    basis: [],
    minGrades: "",
    otherCriteria: [],
    selectionCriteria: [],
    requirements: [],
    requirementTags: [],
    applySteps: [],
    opensAt: "",
    deadline: "",
    deadlineNote: "",
    resultsAt: "",
    rolling: false,
    recurring: true,
    applyUrl: "",
    officialUrl: "",
    extraLinks: [],
    universityIds: [],
    tags: [],
    status: "draft",
  };
}

/**
 * Drafts only need a title, provider and funding type. Publishing needs enough
 * for a student to act on — these are the extra checks.
 */
export function scholarshipPublishIssues(input: ScholarshipInput): string[] {
  const issues: string[] = [];
  if (!input.summary) issues.push("Add a short summary");
  if (input.destinations.length === 0) issues.push("Add at least one destination");
  if (input.studyLevels.length === 0) issues.push("Add at least one study level");
  if (!input.applyUrl && !input.officialUrl) issues.push("Add an apply or official link");
  if (!input.deadline && !input.rolling && !input.deadlineNote) {
    issues.push("Add a deadline, a deadline note, or mark it rolling");
  }
  if (input.nationality.mode !== "any" && input.nationality.countries.length === 0) {
    issues.push("Pick the countries for the nationality rule");
  }
  return issues;
}

/* -------------------------------- University ------------------------------- */

export const universityInputSchema = z.object({
  slug,
  name: requiredText(160, "Name"),
  country: countryCode,
  city: text(80),
  logo: text(300),
  website: optionalUrl,
  aidPageUrl: optionalUrl,
  netPriceCalculatorUrl: optionalUrl,

  aidPolicy: z.enum(AID_POLICIES),
  aidTypes: z.array(z.enum(AID_BASIS)),
  noLoans: z.boolean(),
  requiredForms: z.array(z.enum(AID_FORMS)),
  testPolicy: z.enum(TEST_POLICIES),

  stats: z.object({
    intlStudentsAided: nullableInt(100_000),
    avgAidUsd: nullableInt(500_000),
    costOfAttendanceUsd: nullableInt(500_000),
    dataYear: text(20),
  }),

  deadlines: z
    .array(
      z.object({
        label: requiredText(60, "Deadline label"),
        date: optionalDate.refine((v) => v !== "", "Date is required"),
      }),
    )
    .max(10),
  highlights: lines(10, 200),
  description: text(10000),
  status: z.enum(SCHOLARSHIP_STATUSES),
});

export type UniversityInput = z.infer<typeof universityInputSchema>;

export function emptyUniversityInput(): UniversityInput {
  return {
    slug: "",
    name: "",
    country: "US",
    city: "",
    logo: "",
    website: "",
    aidPageUrl: "",
    netPriceCalculatorUrl: "",
    aidPolicy: "need_aware_partial",
    aidTypes: ["need"],
    noLoans: false,
    requiredForms: [],
    testPolicy: "not_applicable",
    stats: {
      intlStudentsAided: null,
      avgAidUsd: null,
      costOfAttendanceUsd: null,
      dataYear: "",
    },
    deadlines: [],
    highlights: [],
    description: "",
    status: "draft",
  };
}

/* ------------------------------- Submissions ------------------------------- */

export const submissionInputSchema = z
  .object({
    kind: z.enum(["new", "correction"]),
    scholarshipId: objectId.optional(),
    title: requiredText(160, "Name"),
    url: optionalUrl,
    deadline: text(60),
    notes: text(1000),
  })
  .refine((v) => v.kind === "new" || Boolean(v.scholarshipId), {
    message: "Missing scholarship",
    path: ["scholarshipId"],
  });

export type SubmissionInput = z.infer<typeof submissionInputSchema>;

/* --------------------------------- Errors ---------------------------------- */

/** First issue as "field: message" — short enough for a toast. */
export function firstIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Invalid input";
  const path = issue.path.join(".");
  return path ? `${path}: ${issue.message}` : issue.message;
}
