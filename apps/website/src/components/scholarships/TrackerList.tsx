"use client";

import {
  TRACKER_STATUS_LABELS,
  TRACKER_STATUSES,
  isOneOf,
  type TrackerStatus,
} from "@/lib/scholarships/constants";
import { formatUsdShort } from "@/lib/scholarships/format";
import { getDeadlineState } from "@/lib/scholarships/status";
import type { SavedScholarship } from "@/types/scholarships";
import { X } from "lucide-react";
import Link from "next/link";
import posthog from "posthog-js";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import DeadlinePill from "./DeadlinePill";

type Filter = "all" | TrackerStatus;

function sortKey(item: SavedScholarship) {
  const { deadline, rolling } = item.scholarship;
  const state = getDeadlineState(item.scholarship);
  // Upcoming deadlines first, then undated/rolling, closed last.
  if (state.kind === "closed") return `3-${deadline}`;
  if (!deadline || rolling) return "2";
  return `1-${deadline}`;
}

export default function TrackerList({ initialItems }: { initialItems: SavedScholarship[] }) {
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<Filter>("all");

  const sorted = useMemo(
    () => [...items].sort((a, b) => sortKey(a).localeCompare(sortKey(b))),
    [items],
  );
  const visible = filter === "all" ? sorted : sorted.filter((i) => i.status === filter);

  const potential = items
    .filter((i) => i.status !== "rejected")
    .reduce((sum, i) => sum + (i.scholarship.usdPerYearApprox ?? 0), 0);

  async function patch(id: string, body: Record<string, unknown>, method = "PATCH") {
    const res = await fetch("/api/scholarships/saves", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scholarshipId: id, ...body }),
    });
    if (!res.ok) throw new Error();
  }

  async function changeStatus(id: string, status: TrackerStatus) {
    const previous = items;
    setItems((list) => list.map((i) => (i.scholarship.id === id ? { ...i, status } : i)));
    try {
      await patch(id, { status });
      posthog.capture("scholarship_status_changed", { scholarship_id: id, status });
    } catch {
      setItems(previous);
      toast.error("Couldn't update. Please try again.");
    }
  }

  async function remove(id: string) {
    const previous = items;
    setItems((list) => list.filter((i) => i.scholarship.id !== id));
    try {
      await patch(id, {}, "DELETE");
    } catch {
      setItems(previous);
      toast.error("Couldn't remove. Please try again.");
    }
  }

  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-slate-500">
        Nothing saved yet.{" "}
        <Link href="/scholarships" className="font-medium text-blue-600 hover:text-blue-700">
          Browse scholarships
        </Link>{" "}
        and tap the bookmark to track them here.
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <p className="text-sm text-slate-500">
          {items.length} saved
          {potential > 0 && <> · up to {formatUsdShort(potential)} a year in potential funding</>}
        </p>
        <label className="flex items-center gap-1.5 text-sm text-slate-500">
          Show
          <select
            value={filter}
            onChange={(e) =>
              setFilter(isOneOf(TRACKER_STATUSES, e.target.value) ? e.target.value : "all")
            }
            className="cursor-pointer rounded-md bg-transparent py-1 font-medium text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            <option value="all">All</option>
            {TRACKER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {TRACKER_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-500">Nothing here yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {visible.map((item) => {
            const s = item.scholarship;
            const total = s.requirementIds.length;
            const done = item.completedRequirementIds.filter((id) =>
              s.requirementIds.includes(id),
            ).length;

            return (
              <li key={s.id} className="flex items-start gap-3 py-5">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/scholarships/${s.slug}`}
                    className="font-semibold text-slate-900 hover:text-blue-600"
                  >
                    {s.title}
                  </Link>
                  <p className="mt-0.5 text-sm text-slate-500">{s.provider}</p>
                  <p className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-slate-600">
                    <DeadlinePill state={getDeadlineState(s)} />
                    {total > 0 && (
                      <span className="before:mr-1.5 before:text-slate-300 before:content-['·']">
                        {done}/{total} done
                      </span>
                    )}
                  </p>
                </div>
                <select
                  aria-label={`Status for ${s.title}`}
                  value={item.status}
                  onChange={(e) => changeStatus(s.id, e.target.value as TrackerStatus)}
                  className="mt-0.5 h-9 cursor-pointer rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                >
                  {TRACKER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {TRACKER_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  aria-label={`Remove ${s.title}`}
                  title="Remove"
                  onClick={() => remove(s.id)}
                  className="mt-1 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
