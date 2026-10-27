"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getAdminSection, type AdminSectionKey } from "@/lib/admin-access/sections";
import type { PermissionHistoryEntry } from "@/lib/data/admin/permissions";
import { ROLE_LABELS } from "@/lib/role-labels";
import type { Role } from "@/lib/roles";
import { Loader2, Minus, Plus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { actorName, timeAgo } from "./shared";

export type HistoryFilter = { role?: Role; section?: AdminSectionKey } | null;

function filterLabel(filter: HistoryFilter) {
  if (filter?.role) return ROLE_LABELS[filter.role];
  if (filter?.section) return getAdminSection(filter.section).label;
  return null;
}

export function HistorySheet({
  open,
  onOpenChange,
  filter,
  onClearFilter,
  refreshKey,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filter: HistoryFilter;
  onClearFilter: () => void;
  /** Changes after each save so an open sheet reloads. */
  refreshKey: number;
}) {
  const [entries, setEntries] = useState<PermissionHistoryEntry[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (before: string | null) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ limit: "20" });
        if (before) params.set("before", before);
        if (filter?.role) params.set("role", filter.role);
        if (filter?.section) params.set("section", filter.section);
        const res = await fetch(`/api/admin/permissions/history?${params}`);
        if (!res.ok) throw new Error("Couldn't load history");
        const body = (await res.json()) as {
          entries: PermissionHistoryEntry[];
          nextCursor: string | null;
        };
        setEntries((prev) => (before ? [...prev, ...body.entries] : body.entries));
        setCursor(body.nextCursor);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't load history");
      } finally {
        setLoading(false);
      }
    },
    [filter],
  );

  useEffect(() => {
    if (open) void load(null);
  }, [open, load, refreshKey]);

  const label = filterLabel(filter);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>History</SheetTitle>
          <SheetDescription>Every saved change to page access, newest first.</SheetDescription>
        </SheetHeader>

        {label && (
          <button
            type="button"
            onClick={onClearFilter}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 hover:bg-slate-100"
          >
            Only {label}
            <X className="h-3 w-3" aria-hidden />
            <span className="sr-only">Show all changes</span>
          </button>
        )}

        <div className="mt-4 space-y-3">
          {error && <p className="text-sm text-red-600">{error}</p>}

          {!loading && !error && entries.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-500">
              {label
                ? `No saved changes for ${label} yet.`
                : "No changes yet. Every page uses its default access."}
            </p>
          )}

          <ol className="space-y-3">
            {entries.map((entry) => (
              <li key={entry.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {actorName(entry.actor)}
                  </p>
                  <time
                    dateTime={entry.at}
                    title={new Date(entry.at).toLocaleString()}
                    className="shrink-0 text-xs text-slate-400"
                  >
                    {timeAgo(entry.at)}
                  </time>
                </div>
                <ul className="mt-2 space-y-1">
                  {entry.changes.map((change) => {
                    const Icon = change.granted ? Plus : Minus;
                    return (
                      <li
                        key={`${change.section}-${change.role}`}
                        className="flex items-start gap-2 text-sm text-slate-700"
                      >
                        <Icon
                          className={
                            change.granted
                              ? "mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600"
                              : "mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600"
                          }
                        />
                        <span>
                          {ROLE_LABELS[change.role] ?? change.role}
                          {change.granted ? " can now open " : " can no longer open "}
                          {getAdminSection(change.section)?.label ?? change.section}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {entry.note && (
                  <p className="mt-2 border-l-2 border-slate-200 pl-2 text-sm text-slate-600">
                    {entry.note}
                  </p>
                )}
              </li>
            ))}
          </ol>

          {loading && (
            <p className="flex items-center justify-center gap-2 py-4 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </p>
          )}

          {!loading && cursor && (
            <Button variant="outline" className="w-full" onClick={() => void load(cursor)}>
              Load more
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
