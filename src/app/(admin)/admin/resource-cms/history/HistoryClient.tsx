"use client";

import type { PaginationMeta } from "@/lib/pagination";
import {
  hasActiveHistoryFilters,
  type ResourceCMSHistoryFilters,
} from "@/lib/resource-cms/history-filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  AdminResourceSubject,
  ResourceCmsActor,
  ResourceCmsRevisionDetail,
} from "@/types/resources2";
import { format, subDays } from "date-fns";
import { ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import RevisionHistoryCard from "./RevisionHistoryCard";

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

function toDateInputValue(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function buildPageNumbers(current: number, total: number): number[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  return [...pages]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);
}

export default function HistoryClient({
  revisions,
  pagination,
  subjects,
  actors,
  filters,
}: {
  revisions: ResourceCmsRevisionDetail[];
  pagination: PaginationMeta;
  subjects: AdminResourceSubject[];
  actors: ResourceCmsActor[];
  filters: ResourceCMSHistoryFilters;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasFilters = hasActiveHistoryFilters(filters);

  const pageNumbers = useMemo(
    () => buildPageNumbers(pagination.page, pagination.totalPages),
    [pagination.page, pagination.totalPages],
  );

  const updateFilters = useCallback(
    (updates: Record<string, string | undefined>, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      if (resetPage) {
        params.delete("page");
      }
      router.push(`/admin/resource-cms/history?${params.toString()}`);
    },
    [router, searchParams],
  );

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/admin/resource-cms/history?${params.toString()}`);
  }

  function applyPresetRange(preset: "today" | "7d" | "30d" | "all") {
    const today = new Date();
    if (preset === "all") {
      updateFilters({ from: undefined, to: undefined });
      return;
    }
    if (preset === "today") {
      const value = toDateInputValue(today);
      updateFilters({ from: value, to: value });
      return;
    }
    const days = preset === "7d" ? 7 : 30;
    updateFilters({
      from: toDateInputValue(subDays(today, days)),
      to: toDateInputValue(today),
    });
  }

  function clearFilters() {
    router.push("/admin/resource-cms/history");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/resource-cms">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-semibold text-slate-900">
              Resource CMS History
            </h1>
          </div>
          <p className="mt-1 pl-10 text-sm text-slate-500">
            Edit logs and publish backups across all subjects.
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-slate-900">Filters</h2>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-3.5 w-3.5" />
              Clear all
            </Button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500">Subject</Label>
            <Select
              value={filters.slug ?? "all"}
              onValueChange={(value) =>
                updateFilters({ slug: value === "all" ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.slug} value={subject.slug}>
                    {subject.subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500">Person</Label>
            <Select
              value={filters.actorUserId ?? "all"}
              onValueChange={(value) =>
                updateFilters({ actor: value === "all" ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All people" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All people</SelectItem>
                {actors.map((actor) => (
                  <SelectItem key={actor.userId} value={actor.userId}>
                    {actor.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500">Type</Label>
            <Select
              value={filters.kind ?? "all"}
              onValueChange={(value) =>
                updateFilters({ kind: value === "all" ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="edit">Edits</SelectItem>
                <SelectItem value="backup">Backups</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500">Action</Label>
            <Select
              value={filters.action ?? "all"}
              onValueChange={(value) =>
                updateFilters({ action: value === "all" ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                <SelectItem value="save_draft">Save draft</SelectItem>
                <SelectItem value="publish">Publish</SelectItem>
                <SelectItem value="restore">Restore</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500">Snapshot</Label>
            <Select
              value={filters.snapshotScope ?? "all"}
              onValueChange={(value) =>
                updateFilters({
                  snapshotScope: value === "all" ? undefined : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All snapshots" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All snapshots</SelectItem>
                <SelectItem value="draft">Draft only</SelectItem>
                <SelectItem value="live">Live only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500">Per page</Label>
            <Select
              value={String(pagination.limit)}
              onValueChange={(value) => updateFilters({ limit: value }, true)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-slate-500">Time range</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyPresetRange("today")}
            >
              Today
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyPresetRange("7d")}
            >
              Last 7 days
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyPresetRange("30d")}
            >
              Last 30 days
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyPresetRange("all")}
            >
              All time
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="history-from" className="text-xs text-slate-500">
                From
              </Label>
              <Input
                id="history-from"
                type="date"
                value={filters.from ?? ""}
                onChange={(event) =>
                  updateFilters({
                    from: event.target.value || undefined,
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="history-to" className="text-xs text-slate-500">
                To
              </Label>
              <Input
                id="history-to"
                type="date"
                value={filters.to ?? ""}
                onChange={(event) =>
                  updateFilters({
                    to: event.target.value || undefined,
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-500">
        Showing {revisions.length} of {pagination.total} entries
        {hasFilters ? " (filtered)" : ""}
      </p>

      {revisions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white py-12 text-center text-slate-500">
          {hasFilters
            ? "No history entries match your filters."
            : "No history entries yet."}
        </div>
      ) : (
        <div className="space-y-4">
          {revisions.map((revision) => (
            <RevisionHistoryCard
              key={revision._id}
              revision={revision}
              onRestored={() => router.refresh()}
            />
          ))}
        </div>
      )}

      {pagination.total > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrevPage}
              onClick={() => goToPage(pagination.page - 1)}
            >
              Previous
            </Button>
            {pageNumbers.map((pageNumber, index) => {
              const prev = pageNumbers[index - 1];
              const showEllipsis = prev !== undefined && pageNumber - prev > 1;
              return (
                <span key={pageNumber} className="flex items-center gap-2">
                  {showEllipsis && (
                    <span className="px-1 text-slate-400">…</span>
                  )}
                  <Button
                    variant={
                      pageNumber === pagination.page ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => goToPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                </span>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNextPage}
              onClick={() => goToPage(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
