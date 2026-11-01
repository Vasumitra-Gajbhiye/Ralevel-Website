import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/resource-cms/requests/rules";
import type { ResourceChangeRequestStatus } from "@/types/resourceChangeRequests";

const STYLES: Record<ResourceChangeRequestStatus, string> = {
  in_review: "border-amber-200 bg-amber-50 text-amber-800",
  changes_requested: "border-orange-200 bg-orange-50 text-orange-800",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-800",
  rejected: "border-red-200 bg-red-50 text-red-700",
  withdrawn: "border-slate-200 bg-slate-50 text-slate-600",
};

export default function RequestStatusBadge({
  status,
  className,
}: {
  status: ResourceChangeRequestStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
