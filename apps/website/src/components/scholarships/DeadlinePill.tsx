import type { DeadlineState } from "@/lib/scholarships/status";
import { cn } from "@/lib/utils";

const PILL_STYLES: Partial<Record<DeadlineState["kind"], string>> = {
  closing_soon: "bg-amber-50 text-amber-800 ring-amber-200",
  closed: "bg-slate-100 text-slate-600 ring-slate-200",
  opening_soon: "bg-blue-50 text-blue-700 ring-blue-200",
};

/** Plain text normally; a pill only when urgent, closed or not yet open. */
export default function DeadlinePill({ state }: { state: DeadlineState }) {
  const pill = state.highlight ? PILL_STYLES[state.kind] : undefined;
  if (!pill) return <span>{state.label}</span>;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        pill,
      )}
    >
      {state.label}
    </span>
  );
}
