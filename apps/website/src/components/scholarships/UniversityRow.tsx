import { AID_POLICY_LABELS } from "@/lib/scholarships/constants";
import { countryName } from "@/lib/scholarships/countries";
import { formatUsdShort } from "@/lib/scholarships/format";
import type { UniversitySummary } from "@/types/scholarships";
import Link from "next/link";

export default function UniversityRow({ university }: { university: UniversitySummary }) {
  const place = [university.city, countryName(university.country)].filter(Boolean).join(", ");

  return (
    <li className="group relative flex items-center gap-4 py-4">
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600">
          <Link
            href={`/scholarships/universities/${university.slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-blue-300"
          >
            {university.name}
          </Link>
        </h3>
        <p className="mt-0.5 text-sm text-slate-500">
          {place} · {AID_POLICY_LABELS[university.aidPolicy]}
        </p>
      </div>
      {university.avgAidUsd !== null && (
        <div className="shrink-0 text-right">
          <p className="font-semibold text-slate-900">{formatUsdShort(university.avgAidUsd)}</p>
          <p className="text-xs text-slate-500">avg. aid / yr</p>
        </div>
      )}
    </li>
  );
}
