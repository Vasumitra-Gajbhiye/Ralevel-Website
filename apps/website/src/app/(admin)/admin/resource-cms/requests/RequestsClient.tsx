"use client";

import { ListPagination } from "@/components/ui/list-pagination";
import type { PaginationMeta } from "@/lib/pagination";
import { cn } from "@/lib/utils";
import type { ResourceChangeRequestListItem } from "@/types/resourceChangeRequests";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RequestStatusBadge from "../components/RequestStatusBadge";

export type RequestsTab = "needs-review" | "open" | "closed" | "all";

const TAB_LABELS: Record<RequestsTab, string> = {
  "needs-review": "Needs review",
  open: "Open",
  closed: "Closed",
  all: "All",
};

const personName = (p: { name?: string | null; email: string }) => p.name || p.email;

export default function RequestsClient({
  requests,
  pagination,
  tab,
  mine,
  needsReview,
  canPublish,
}: {
  requests: ResourceChangeRequestListItem[];
  pagination: PaginationMeta;
  tab: RequestsTab;
  mine: boolean;
  needsReview: number;
  canPublish: boolean;
}) {
  const router = useRouter();

  const href = (next: { tab?: RequestsTab; mine?: boolean; page?: number }) => {
    const params = new URLSearchParams();
    params.set("tab", next.tab ?? tab);
    if (next.mine ?? mine) params.set("mine", "1");
    if (next.page && next.page > 1) params.set("page", String(next.page));
    return `/admin/resource-cms/requests?${params}`;
  };

  const tabs: RequestsTab[] = canPublish
    ? ["needs-review", "open", "closed", "all"]
    : ["open", "closed", "all"];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Change requests</h1>
        <p className="mt-1 text-sm text-slate-500">
          Staff edits to resource pages wait here until a head or admin reviews them.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200">
        <nav className="flex gap-1">
          {tabs.map((key) => (
            <Link
              key={key}
              href={href({ tab: key, page: 1 })}
              className={cn(
                "-mb-px border-b-2 px-3 py-2 text-sm font-medium",
                key === tab
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-800",
              )}
            >
              {TAB_LABELS[key]}
              {key === "needs-review" && needsReview > 0 && (
                <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
                  {needsReview}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <label className="mb-2 flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={mine}
            onChange={(e) => router.push(href({ mine: e.target.checked, page: 1 }))}
            className="h-4 w-4 rounded border-slate-300"
          />
          Only mine
        </label>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          {tab === "needs-review" ? "Nothing waiting for review." : "No requests here."}
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {requests.map((r) => (
            <li key={r.number}>
              <Link
                href={`/admin/resource-cms/requests/${r.number}`}
                className="flex flex-col gap-1 px-4 py-3 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    <span className="text-slate-400">#{r.number}</span> {r.title}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {r.subject} · {personName(r.author)} ·{" "}
                    {r.changeCount} change{r.changeCount === 1 ? "" : "s"} · updated{" "}
                    {formatDistanceToNow(new Date(r.lastActivityAt), { addSuffix: true })}
                  </p>
                </div>
                <RequestStatusBadge status={r.status} className="self-start sm:self-auto" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <ListPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(page) => router.push(href({ page }))}
      />
    </div>
  );
}
