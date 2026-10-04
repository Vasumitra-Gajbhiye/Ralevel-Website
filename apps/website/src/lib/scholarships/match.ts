import type { ScholarshipDetail, StudyPlans } from "@/types/scholarships";
import { ANY_COUNTRY } from "./constants";

export type CheckResult = "yes" | "no" | "unknown";

export type EligibilityCheck = {
  nationality: CheckResult;
  destination: CheckResult;
  field: CheckResult;
};

export function hasStudyPlans(plans: StudyPlans | null | undefined): plans is StudyPlans {
  return Boolean(
    plans &&
      (plans.nationalities.length > 0 ||
        plans.studyDestinations.length > 0 ||
        plans.intendedFields.length > 0),
  );
}

function checkNationality(
  rule: ScholarshipDetail["nationality"],
  nationalities: string[],
): CheckResult {
  if (rule.mode === "any") return "yes";
  if (nationalities.length === 0) return "unknown";
  // Dual nationals qualify if any one passport is eligible.
  const eligible = nationalities.some((n) =>
    rule.mode === "include" ? rule.countries.includes(n) : !rule.countries.includes(n),
  );
  return eligible ? "yes" : "no";
}

function checkDestination(destinations: string[], wanted: string[]): CheckResult {
  if (wanted.length === 0) return "unknown";
  if (destinations.includes(ANY_COUNTRY)) return "yes";
  return destinations.some((d) => wanted.includes(d)) ? "yes" : "no";
}

function checkField(fields: string[], wanted: string[]): CheckResult {
  if (fields.length === 0) return "yes"; // open to every field
  if (wanted.length === 0) return "unknown";
  return fields.some((f) => wanted.includes(f)) ? "yes" : "no";
}

export function evaluateEligibility(
  scholarship: Pick<ScholarshipDetail, "nationality" | "destinations" | "fieldsOfStudy">,
  plans: StudyPlans,
): EligibilityCheck {
  return {
    nationality: checkNationality(scholarship.nationality, plans.nationalities),
    destination: checkDestination(scholarship.destinations, plans.studyDestinations),
    field: checkField(scholarship.fieldsOfStudy, plans.intendedFields),
  };
}

/**
 * Mongo conditions equivalent to evaluateEligibility() returning no "no".
 * Criteria the student hasn't filled in are ignored rather than excluded.
 */
export function buildMatchConditions(plans: StudyPlans): Record<string, unknown>[] {
  const conditions: Record<string, unknown>[] = [];

  if (plans.nationalities.length > 0) {
    conditions.push({ $or: nationalityConditions(plans.nationalities) });
  }

  if (plans.studyDestinations.length > 0) {
    conditions.push({
      destinations: { $in: [...plans.studyDestinations, ANY_COUNTRY] },
    });
  }

  if (plans.intendedFields.length > 0) {
    conditions.push({
      $or: [
        { fieldsOfStudy: { $size: 0 } },
        { fieldsOfStudy: { $in: plans.intendedFields } },
      ],
    });
  }

  return conditions;
}

export function nationalityConditions(nationalities: string[]): Record<string, unknown>[] {
  return [
    { "nationality.mode": "any" },
    { "nationality.mode": "include", "nationality.countries": { $in: nationalities } },
    ...nationalities.map((n) => ({
      "nationality.mode": "exclude",
      "nationality.countries": { $ne: n },
    })),
  ];
}
