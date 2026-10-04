import {
  emptyScholarshipInput,
  emptyUniversityInput,
  firstIssue,
  scholarshipInputSchema,
  universityInputSchema,
  type ScholarshipInput,
  type UniversityInput,
} from "@/lib/validation/scholarships";
import { ANY_COUNTRY } from "./constants";
import { COUNTRIES } from "./countries";

/*
 * CSV conventions (also shown in the template):
 *   lists     "a|b|c"        booleans  yes / no
 *   dates     YYYY-MM-DD     countries ISO code ("CA") or name ("Canada")
 *   requirements / applySteps: "Title :: optional detail|Next item"
 */

export type CsvKind = "scholarships" | "universities";

export const SCHOLARSHIP_CSV_COLUMNS = [
  "slug",
  "title",
  "provider",
  "providerType",
  "summary",
  "description",
  "fundingType",
  "amountText",
  "usdPerYearApprox",
  "covers",
  "renewable",
  "durationYears",
  "studyLevels",
  "destinations",
  "nationalityMode",
  "nationalityCountries",
  "nationalityNote",
  "fieldsOfStudy",
  "basis",
  "minGrades",
  "otherCriteria",
  "selectionCriteria",
  "requirements",
  "requirementTags",
  "applySteps",
  "opensAt",
  "deadline",
  "deadlineNote",
  "resultsAt",
  "rolling",
  "recurring",
  "applyUrl",
  "officialUrl",
  "tags",
] as const;

export const UNIVERSITY_CSV_COLUMNS = [
  "slug",
  "name",
  "country",
  "city",
  "website",
  "aidPageUrl",
  "netPriceCalculatorUrl",
  "aidPolicy",
  "aidTypes",
  "noLoans",
  "requiredForms",
  "testPolicy",
  "intlStudentsAided",
  "avgAidUsd",
  "costOfAttendanceUsd",
  "dataYear",
  "highlights",
  "description",
] as const;

const EXAMPLE_SCHOLARSHIP: Record<(typeof SCHOLARSHIP_CSV_COLUMNS)[number], string> = {
  slug: "example-scholarship",
  title: "Example Scholarship",
  provider: "Example University",
  providerType: "university",
  summary: "Covers tuition and living costs for four years.",
  description: "",
  fundingType: "full",
  amountText: "About USD 60,000 a year",
  usdPerYearApprox: "60000",
  covers: "tuition|living|accommodation",
  renewable: "yes",
  durationYears: "4",
  studyLevels: "undergraduate",
  destinations: "US",
  nationalityMode: "any",
  nationalityCountries: "",
  nationalityNote: "",
  fieldsOfStudy: "",
  basis: "merit|need",
  minGrades: "A*AA",
  otherCriteria: "Must be starting a first degree",
  selectionCriteria: "Academic excellence|Leadership",
  requirements: "Personal essay :: 500 words|Two recommendation letters",
  requirementTags: "essay|recommendation",
  applySteps: "Apply for admission|Submit the scholarship form :: by the deadline",
  opensAt: "2026-09-01",
  deadline: "2027-01-15",
  deadlineNote: "",
  resultsAt: "2027-03-30",
  rolling: "no",
  recurring: "yes",
  applyUrl: "https://example.edu/apply",
  officialUrl: "https://example.edu/scholarship",
  tags: "stem",
};

const EXAMPLE_UNIVERSITY: Record<(typeof UNIVERSITY_CSV_COLUMNS)[number], string> = {
  slug: "example-university",
  name: "Example University",
  country: "US",
  city: "Boston",
  website: "https://example.edu",
  aidPageUrl: "https://example.edu/aid",
  netPriceCalculatorUrl: "",
  aidPolicy: "need_aware_full_need",
  aidTypes: "need",
  noLoans: "yes",
  requiredForms: "css_profile",
  testPolicy: "optional",
  intlStudentsAided: "250",
  avgAidUsd: "70000",
  costOfAttendanceUsd: "88000",
  dataYear: "2024-25",
  highlights: "Meets 100% of demonstrated need",
  description: "",
};

function csvEscape(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function csvTemplate(kind: CsvKind): string {
  const columns: readonly string[] =
    kind === "scholarships" ? SCHOLARSHIP_CSV_COLUMNS : UNIVERSITY_CSV_COLUMNS;
  const example: Record<string, string> =
    kind === "scholarships" ? EXAMPLE_SCHOLARSHIP : EXAMPLE_UNIVERSITY;
  return [columns.join(","), columns.map((c) => csvEscape(example[c] ?? "")).join(",")].join("\n");
}

/* --------------------------------- Parsing --------------------------------- */

const COUNTRY_BY_NAME = new Map(COUNTRIES.map((c) => [c.name.toLowerCase(), c.code]));

function cell(row: Record<string, string>, key: string) {
  return (row[key] ?? "").trim();
}

function list(value: string) {
  return value
    .split("|")
    .map((v) => v.trim())
    .filter(Boolean);
}

function keys(value: string) {
  return list(value).map((v) => v.toLowerCase().replace(/[\s-]+/g, "_"));
}

function countries(value: string) {
  return list(value).map((v) => {
    if (v.toUpperCase() === ANY_COUNTRY) return ANY_COUNTRY;
    return COUNTRY_BY_NAME.get(v.toLowerCase()) ?? v.toUpperCase();
  });
}

function bool(value: string, fallback: boolean) {
  if (!value) return fallback;
  return ["yes", "y", "true", "1"].includes(value.toLowerCase());
}

function numberOrNull(value: string) {
  if (!value) return null;
  const n = Number(value.replace(/[,$\s]/g, ""));
  return Number.isFinite(n) ? Math.round(n) : NaN;
}

function titled(value: string) {
  return list(value).map((item) => {
    const [title, ...rest] = item.split("::");
    return { title: title.trim(), detail: rest.join("::").trim() };
  });
}

export function rowToScholarshipInput(row: Record<string, string>): ScholarshipInput {
  const base = emptyScholarshipInput();
  const value = (key: string) => cell(row, key);
  const str = (key: string, fallback: string) => value(key) || fallback;

  return {
    ...base,
    slug: value("slug").toLowerCase(),
    title: value("title"),
    provider: value("provider"),
    providerType: str("providerType", base.providerType).toLowerCase() as ScholarshipInput["providerType"],
    summary: value("summary"),
    description: value("description"),
    fundingType: str("fundingType", base.fundingType).toLowerCase() as ScholarshipInput["fundingType"],
    amountText: value("amountText"),
    usdPerYearApprox: numberOrNull(value("usdPerYearApprox")),
    covers: keys(value("covers")) as ScholarshipInput["covers"],
    renewable: bool(value("renewable"), false),
    durationYears: numberOrNull(value("durationYears")),
    studyLevels: value("studyLevels")
      ? (keys(value("studyLevels")) as ScholarshipInput["studyLevels"])
      : base.studyLevels,
    destinations: countries(value("destinations")),
    nationality: {
      mode: str("nationalityMode", "any").toLowerCase() as ScholarshipInput["nationality"]["mode"],
      countries: countries(value("nationalityCountries")),
      note: value("nationalityNote"),
    },
    fieldsOfStudy: keys(value("fieldsOfStudy")) as ScholarshipInput["fieldsOfStudy"],
    basis: keys(value("basis")) as ScholarshipInput["basis"],
    minGrades: value("minGrades"),
    otherCriteria: list(value("otherCriteria")),
    selectionCriteria: list(value("selectionCriteria")),
    requirements: titled(value("requirements")).map(({ title, detail }) => ({
      label: title,
      detail,
    })),
    requirementTags: keys(value("requirementTags")) as ScholarshipInput["requirementTags"],
    applySteps: titled(value("applySteps")),
    opensAt: value("opensAt"),
    deadline: value("deadline"),
    deadlineNote: value("deadlineNote"),
    resultsAt: value("resultsAt"),
    rolling: bool(value("rolling"), false),
    recurring: bool(value("recurring"), true),
    applyUrl: value("applyUrl"),
    officialUrl: value("officialUrl"),
    tags: list(value("tags")),
    status: "draft",
  };
}

export function rowToUniversityInput(row: Record<string, string>): UniversityInput {
  const base = emptyUniversityInput();
  const value = (key: string) => cell(row, key);
  const [country] = countries(value("country"));

  return {
    ...base,
    slug: value("slug").toLowerCase(),
    name: value("name"),
    country: country ?? "",
    city: value("city"),
    website: value("website"),
    aidPageUrl: value("aidPageUrl"),
    netPriceCalculatorUrl: value("netPriceCalculatorUrl"),
    aidPolicy: (value("aidPolicy").toLowerCase() || base.aidPolicy) as UniversityInput["aidPolicy"],
    aidTypes: value("aidTypes")
      ? (keys(value("aidTypes")) as UniversityInput["aidTypes"])
      : base.aidTypes,
    noLoans: bool(value("noLoans"), false),
    requiredForms: keys(value("requiredForms")) as UniversityInput["requiredForms"],
    testPolicy: (value("testPolicy").toLowerCase() || base.testPolicy) as UniversityInput["testPolicy"],
    stats: {
      intlStudentsAided: numberOrNull(value("intlStudentsAided")),
      avgAidUsd: numberOrNull(value("avgAidUsd")),
      costOfAttendanceUsd: numberOrNull(value("costOfAttendanceUsd")),
      dataYear: value("dataYear"),
    },
    highlights: list(value("highlights")),
    description: value("description"),
    status: "draft",
  };
}

export type ParsedRow =
  | { ok: true; label: string; input: ScholarshipInput | UniversityInput }
  | { ok: false; label: string; error: string };

/** Map + validate every CSV row; invalid rows carry a human-readable reason. */
export function parseCsvRows(kind: CsvKind, rows: Record<string, string>[]): ParsedRow[] {
  return rows.map((row) => {
    if (kind === "scholarships") {
      const input = rowToScholarshipInput(row);
      const parsed = scholarshipInputSchema.safeParse(input);
      return parsed.success
        ? { ok: true, label: input.title, input: parsed.data }
        : { ok: false, label: input.title || "(no title)", error: firstIssue(parsed.error) };
    }
    const input = rowToUniversityInput(row);
    const parsed = universityInputSchema.safeParse(input);
    return parsed.success
      ? { ok: true, label: input.name, input: parsed.data }
      : { ok: false, label: input.name || "(no name)", error: firstIssue(parsed.error) };
  });
}
