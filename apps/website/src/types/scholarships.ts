import type {
  AidBasis,
  AidForm,
  AidPolicy,
  Cover,
  FieldOfStudy,
  FundingType,
  NationalityMode,
  ProviderType,
  RequirementTag,
  ScholarshipStatus,
  StudyLevel,
  TestPolicy,
  TrackerStatus,
} from "@/lib/scholarships/constants";

/** Dates are "YYYY-MM-DD" (UTC) strings, or null when unset. */

export type ScholarshipSummary = {
  id: string;
  slug: string;
  title: string;
  provider: string;
  logo: string;
  fundingType: FundingType;
  amountText: string;
  usdPerYearApprox: number | null;
  destinations: string[];
  studyLevels: StudyLevel[];
  deadline: string | null;
  opensAt: string | null;
  deadlineNote: string;
  rolling: boolean;
};

export type ScholarshipDetail = ScholarshipSummary & {
  providerType: ProviderType;
  summary: string;
  description: string;
  covers: Cover[];
  renewable: boolean;
  durationYears: number | null;
  nationality: { mode: NationalityMode; countries: string[]; note: string };
  fieldsOfStudy: FieldOfStudy[];
  basis: AidBasis[];
  minGrades: string;
  otherCriteria: string[];
  selectionCriteria: string[];
  requirements: { id: string; label: string; detail: string }[];
  requirementTags: RequirementTag[];
  applySteps: { title: string; detail: string }[];
  resultsAt: string | null;
  recurring: boolean;
  applyUrl: string;
  officialUrl: string;
  extraLinks: { label: string; url: string }[];
  universities: { slug: string; name: string }[];
  lastVerifiedAt: string | null;
  status: ScholarshipStatus;
};

export type UniversitySummary = {
  id: string;
  slug: string;
  name: string;
  country: string;
  city: string;
  logo: string;
  aidPolicy: AidPolicy;
  avgAidUsd: number | null;
  costOfAttendanceUsd: number | null;
};

export type UniversityDetail = UniversitySummary & {
  website: string;
  aidPageUrl: string;
  netPriceCalculatorUrl: string;
  aidTypes: AidBasis[];
  noLoans: boolean;
  requiredForms: AidForm[];
  testPolicy: TestPolicy;
  intlStudentsAided: number | null;
  dataYear: string;
  deadlines: { label: string; date: string }[];
  highlights: string[];
  description: string;
  lastVerifiedAt: string | null;
  status: ScholarshipStatus;
};

export type SavedScholarship = {
  scholarship: ScholarshipSummary & {
    requirementIds: string[];
  };
  status: TrackerStatus;
  completedRequirementIds: string[];
  updatedAt: string;
};

/** Minimal save state for rendering Save buttons / checklists. */
export type SaveState = {
  status: TrackerStatus;
  completedRequirementIds: string[];
};

/** Profile fields used for matching. */
export type StudyPlans = {
  nationalities: string[];
  studyDestinations: string[];
  intendedFields: string[];
};
