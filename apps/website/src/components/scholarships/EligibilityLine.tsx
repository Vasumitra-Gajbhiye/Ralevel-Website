import { FIELD_OF_STUDY_LABELS, type FieldOfStudy } from "@/lib/scholarships/constants";
import { countryName } from "@/lib/scholarships/countries";
import { evaluateEligibility, hasStudyPlans, type CheckResult } from "@/lib/scholarships/match";
import { cn } from "@/lib/utils";
import type { ScholarshipDetail, StudyPlans } from "@/types/scholarships";
import { Check, X } from "lucide-react";
import Link from "next/link";

function Item({ result, children }: { result: CheckResult; children: React.ReactNode }) {
  if (result === "unknown") return null;
  const Icon = result === "yes" ? Check : X;
  return (
    <li
      className={cn(
        "inline-flex items-center gap-1.5 text-sm",
        result === "yes" ? "text-emerald-700" : "text-slate-500",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {children}
    </li>
  );
}

/** One line of ✓/✗ against the student's study plans. */
export default function EligibilityLine({
  scholarship,
  plans,
  signedIn,
}: {
  scholarship: ScholarshipDetail;
  plans: StudyPlans | null;
  signedIn: boolean;
}) {
  const linkClass = "font-medium text-blue-600 hover:text-blue-700";

  if (!hasStudyPlans(plans)) {
    return (
      <p className="text-sm text-slate-500">
        {signedIn ? (
          <Link href="/profile" className={linkClass}>
            Add your nationality to your profile
          </Link>
        ) : (
          <Link href={`/sign-in?redirect_url=/scholarships/${scholarship.slug}`} className={linkClass}>
            Sign in
          </Link>
        )}{" "}
        to check your eligibility here.
      </p>
    );
  }

  const check = evaluateEligibility(scholarship, plans);
  const nationality = plans.nationalities.map(countryName).join(" / ");
  const matchedDestination = scholarship.destinations.find((d) =>
    plans.studyDestinations.includes(d),
  );
  const matchedField = scholarship.fieldsOfStudy.find((f) => plans.intendedFields.includes(f));

  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
      <Item result={check.nationality}>
        {check.nationality === "yes"
          ? scholarship.nationality.mode === "any"
            ? "Open to all nationalities"
            : `Open to ${nationality} citizens`
          : `Not open to ${nationality} citizens`}
      </Item>
      <Item result={check.destination}>
        {check.destination === "yes"
          ? matchedDestination
            ? `${countryName(matchedDestination)} is on your list`
            : "Study anywhere"
          : "Not in a country on your list"}
      </Item>
      <Item result={check.field}>
        {check.field === "yes"
          ? matchedField
            ? `Covers ${FIELD_OF_STUDY_LABELS[matchedField as FieldOfStudy]}`
            : "Any field of study"
          : "Not for your fields of interest"}
      </Item>
    </ul>
  );
}
