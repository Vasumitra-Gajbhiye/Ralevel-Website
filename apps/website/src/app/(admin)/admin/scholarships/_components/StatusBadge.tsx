import type { ScholarshipStatus } from "@/lib/scholarships/constants";
import { cn } from "@/lib/utils";

const STYLES: Record<ScholarshipStatus, string> = {
  published: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  draft: "bg-slate-100 text-slate-600 ring-slate-200",
  archived: "bg-white text-slate-400 ring-slate-200",
};

const LABELS: Record<ScholarshipStatus, string> = {
  published: "Published",
  draft: "Draft",
  archived: "Archived",
};

export default function StatusBadge({ status }: { status: ScholarshipStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        STYLES[status],
      )}
    >
      {LABELS[status]}
    </span>
  );
}
