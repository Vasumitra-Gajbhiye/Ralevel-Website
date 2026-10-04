import { FUNDING_TYPE_LABELS } from "@/lib/scholarships/constants";
import { formatDestinations } from "@/lib/scholarships/format";
import { getDeadlineState } from "@/lib/scholarships/status";
import type { SaveState, ScholarshipSummary } from "@/types/scholarships";
import Link from "next/link";
import DeadlinePill from "./DeadlinePill";
import { SaveButton, SaveStateProvider } from "./SaveState";

/** "Full funding", or the amount text for anything less than full. */
export function fundingText(s: Pick<ScholarshipSummary, "fundingType" | "amountText">) {
  if (s.fundingType !== "full" && s.amountText) return s.amountText;
  return FUNDING_TYPE_LABELS[s.fundingType];
}

/** Title, provider, one line of facts. The whole row is the link. */
export default function ScholarshipRow({
  scholarship,
  saveState,
  signedIn,
}: {
  scholarship: ScholarshipSummary;
  saveState: SaveState | null;
  signedIn: boolean;
}) {
  const deadline = getDeadlineState(scholarship);
  const facts = [fundingText(scholarship), formatDestinations(scholarship.destinations)].filter(
    Boolean,
  );

  return (
    <li className="group relative flex items-start gap-3 py-5">
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600">
          <Link
            href={`/scholarships/${scholarship.slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-blue-300"
          >
            {scholarship.title}
          </Link>
        </h3>
        <p className="mt-0.5 text-sm text-slate-500">{scholarship.provider}</p>
        <p className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-slate-600">
          {facts.map((fact) => (
            <span key={fact} className="after:ml-1.5 after:text-slate-300 after:content-['·']">
              {fact}
            </span>
          ))}
          <DeadlinePill state={deadline} />
        </p>
      </div>
      <SaveStateProvider
        scholarshipId={scholarship.id}
        initialState={saveState}
        signedIn={signedIn}
      >
        <SaveButton className="-mr-2 -mt-1" />
      </SaveStateProvider>
    </li>
  );
}
