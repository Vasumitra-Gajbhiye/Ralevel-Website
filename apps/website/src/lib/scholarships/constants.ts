/* ------------------------------- Scholarships ------------------------------ */

export const SCHOLARSHIP_STATUSES = ["draft", "published", "archived"] as const;
export type ScholarshipStatus = (typeof SCHOLARSHIP_STATUSES)[number];

export const PROVIDER_TYPES = [
  "government",
  "university",
  "foundation",
  "corporate",
  "other",
] as const;
export type ProviderType = (typeof PROVIDER_TYPES)[number];

export const PROVIDER_TYPE_LABELS: Record<ProviderType, string> = {
  government: "Government",
  university: "University",
  foundation: "Foundation",
  corporate: "Company",
  other: "Other",
};

export const FUNDING_TYPES = [
  "full",
  "tuition",
  "partial",
  "stipend",
  "one_off",
] as const;
export type FundingType = (typeof FUNDING_TYPES)[number];

export const FUNDING_TYPE_LABELS: Record<FundingType, string> = {
  full: "Full funding",
  tuition: "Tuition only",
  partial: "Partial funding",
  stipend: "Living stipend",
  one_off: "One-off award",
};

export const COVERS = [
  "tuition",
  "living",
  "accommodation",
  "travel",
  "insurance",
  "books",
] as const;
export type Cover = (typeof COVERS)[number];

export const COVER_LABELS: Record<Cover, string> = {
  tuition: "tuition",
  living: "living costs",
  accommodation: "accommodation",
  travel: "flights",
  insurance: "health insurance",
  books: "books",
};

export const STUDY_LEVELS = [
  "undergraduate",
  "foundation",
  "summer_school",
  "competition",
  "pre_university",
] as const;
export type StudyLevel = (typeof STUDY_LEVELS)[number];

export const STUDY_LEVEL_LABELS: Record<StudyLevel, string> = {
  undergraduate: "Undergraduate",
  foundation: "Foundation year",
  summer_school: "Summer school",
  competition: "Competition",
  pre_university: "Pre-university",
};

export const AID_BASIS = ["merit", "need"] as const;
export type AidBasis = (typeof AID_BASIS)[number];

export const AID_BASIS_LABELS: Record<AidBasis, string> = {
  merit: "Merit-based",
  need: "Need-based",
};

export const NATIONALITY_MODES = ["any", "include", "exclude"] as const;
export type NationalityMode = (typeof NATIONALITY_MODES)[number];

export const REQUIREMENT_TAGS = [
  "essay",
  "recommendation",
  "interview",
  "sat_act",
  "english_test",
  "css_profile",
  "portfolio",
] as const;
export type RequirementTag = (typeof REQUIREMENT_TAGS)[number];

export const REQUIREMENT_TAG_LABELS: Record<RequirementTag, string> = {
  essay: "Essay",
  recommendation: "Recommendation letters",
  interview: "Interview",
  sat_act: "SAT / ACT",
  english_test: "English test (IELTS / TOEFL)",
  css_profile: "CSS Profile",
  portfolio: "Portfolio",
};

export const SCHOLARSHIP_SOURCES = [
  "admin",
  "seed",
  "import",
  "community",
] as const;
export type ScholarshipSource = (typeof SCHOLARSHIP_SOURCES)[number];

export const FIELDS_OF_STUDY = [
  "business",
  "computing",
  "economics",
  "engineering",
  "humanities",
  "law",
  "medicine",
  "natural_sciences",
  "arts",
  "social_sciences",
  "mathematics",
  "education",
] as const;
export type FieldOfStudy = (typeof FIELDS_OF_STUDY)[number];

export const FIELD_OF_STUDY_LABELS: Record<FieldOfStudy, string> = {
  business: "Business & Management",
  computing: "Computer Science",
  economics: "Economics & Finance",
  engineering: "Engineering",
  humanities: "Humanities",
  law: "Law",
  medicine: "Medicine & Health",
  natural_sciences: "Natural Sciences",
  arts: "Arts & Design",
  social_sciences: "Social Sciences",
  mathematics: "Mathematics",
  education: "Education",
};

/** Wildcard destination: the scholarship can be used in any country. */
export const ANY_COUNTRY = "ANY";

/** Slugs that would collide with static routes under /scholarships. */
export const RESERVED_SCHOLARSHIP_SLUGS = ["universities", "saved"] as const;

/** Deadline within this many days counts as "closing soon". */
export const CLOSING_SOON_DAYS = 14;

/* --------------------------------- Tracker --------------------------------- */

export const TRACKER_STATUSES = [
  "saved",
  "preparing",
  "applied",
  "awarded",
  "rejected",
] as const;
export type TrackerStatus = (typeof TRACKER_STATUSES)[number];

export const TRACKER_STATUS_LABELS: Record<TrackerStatus, string> = {
  saved: "Saved",
  preparing: "Preparing",
  applied: "Applied",
  awarded: "Awarded",
  rejected: "Not selected",
};

/* ------------------------------- Universities ------------------------------ */

export const AID_POLICIES = [
  "need_blind_full_need",
  "need_aware_full_need",
  "need_aware_partial",
  "merit_only",
  "limited",
] as const;
export type AidPolicy = (typeof AID_POLICIES)[number];

export const AID_POLICY_LABELS: Record<AidPolicy, string> = {
  need_blind_full_need: "Need-blind · meets full need",
  need_aware_full_need: "Meets full need",
  need_aware_partial: "Need-based aid",
  merit_only: "Merit scholarships",
  limited: "Limited aid",
};

export const AID_POLICY_DESCRIPTIONS: Record<AidPolicy, string> = {
  need_blind_full_need:
    "Your ability to pay isn't considered when you apply, and if you're admitted they cover everything your family can't afford.",
  need_aware_full_need:
    "They may consider your finances when deciding, but if you're admitted they cover everything your family can't afford.",
  need_aware_partial:
    "They give need-based aid to international students, but it may not cover your full need.",
  merit_only:
    "Aid for international students comes from merit scholarships rather than need-based grants.",
  limited: "Very little institutional aid is available to international students.",
};

export const AID_FORMS = ["css_profile", "isfaa", "idoc", "institutional"] as const;
export type AidForm = (typeof AID_FORMS)[number];

export const AID_FORM_LABELS: Record<AidForm, string> = {
  css_profile: "CSS Profile",
  isfaa: "ISFAA",
  idoc: "IDOC",
  institutional: "University's own aid form",
};

export const TEST_POLICIES = ["required", "optional", "blind", "not_applicable"] as const;
export type TestPolicy = (typeof TEST_POLICIES)[number];

export const TEST_POLICY_LABELS: Record<TestPolicy, string> = {
  required: "SAT/ACT required",
  optional: "Test-optional",
  blind: "Test-blind",
  not_applicable: "Not applicable / not set",
};

/* --------------------------------- Helpers --------------------------------- */

export function isOneOf<T extends string>(
  list: readonly T[],
  value: unknown,
): value is T {
  return typeof value === "string" && (list as readonly string[]).includes(value);
}
