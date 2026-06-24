"use client";

import { groupResourceCmsChanges } from "@/lib/resource-cms/diff";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ResourceCmsRevisionDetail } from "@/types/resources2";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

function actionLabel(action: string, kind: string): string {
  if (kind === "backup") return "Backup";
  switch (action) {
    case "save_draft":
      return "Save draft";
    case "publish":
      return "Publish";
    case "restore":
      return "Restore";
    default:
      return action;
  }
}

function ValueBlock({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "before" | "after";
}) {
  const isEmpty = !value.trim();
  return (
    <div
      className={
        tone === "before"
          ? "rounded-md border border-red-100 bg-red-50/70 p-3"
          : "rounded-md border border-emerald-100 bg-emerald-50/70 p-3"
      }
    >
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="whitespace-pre-wrap break-words text-sm text-slate-800">
        {isEmpty ? "(empty)" : value}
      </p>
    </div>
  );
}

export default function RevisionHistoryCard({
  revision,
  onRestored,
}: {
  revision: ResourceCmsRevisionDetail;
  onRestored: () => void;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const groupedChanges = useMemo(
    () => groupResourceCmsChanges(revision.changes),
    [revision.changes],
  );

  async function handleRestore() {
    setIsRestoring(true);
    try {
      const res = await fetch(
        `/api/admin/resource-cms/${revision.slug}/restore`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ revisionId: revision._id }),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to restore");
      }

      toast.success(
        `Restored ${revision.subject} draft. Review in the editor before publishing.`,
      );
      setConfirmOpen(false);
      onRestored();
      router.push(`/admin/resource-cms/${revision.slug}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to restore");
    } finally {
      setIsRestoring(false);
    }
  }

  return (
    <>
      <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/admin/resource-cms/${revision.slug}`}
                className="text-lg font-semibold text-slate-900 hover:text-blue-600"
              >
                {revision.subject}
              </Link>
              <Badge variant="outline">{revision.kind}</Badge>
              <Badge variant="secondary">
                {actionLabel(revision.action, revision.kind)}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
              <span>{format(new Date(revision.createdAt), "PPpp")}</span>
              <span>{revision.actor.email}</span>
              <span className="capitalize">
                {revision.snapshotScope} snapshot
              </span>
            </div>
            {revision.restoredFromId && (
              <p className="text-sm text-slate-600">
                Restored from revision {revision.restoredFromId}
              </p>
            )}
            {revision.message && (
              <p className="rounded-md bg-slate-50 p-2 text-sm text-slate-700">
                {revision.message}
              </p>
            )}
          </div>

          {revision.hasSnapshot && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmOpen(true)}
              disabled={isRestoring}
              className="shrink-0"
            >
              Restore to draft
            </Button>
          )}
        </div>

        <div className="pt-4">
          {groupedChanges.length === 0 ? (
            <p className="text-sm text-slate-500">
              {revision.kind === "backup"
                ? "Publish backup snapshot (no diff recorded)."
                : "No content changes recorded."}
            </p>
          ) : (
            <div className="space-y-4">
              {groupedChanges.map((change, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-slate-100 bg-slate-50/50 p-4"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{change.sectionLabel}</Badge>
                    {change.type === "added" && (
                      <Badge className="bg-emerald-600">Added</Badge>
                    )}
                    {change.type === "removed" && (
                      <Badge variant="destructive">Removed</Badge>
                    )}
                    {change.type === "modified" && (
                      <Badge variant="secondary">Updated</Badge>
                    )}
                    <span className="font-medium text-slate-900">
                      {change.label}
                    </span>
                  </div>

                  {change.type === "modified" && (
                    <div className="space-y-3">
                      {change.fields.map((field) => (
                        <div key={field.field} className="space-y-2">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            {field.fieldLabel}
                          </p>
                          <div className="grid gap-3 md:grid-cols-2">
                            <ValueBlock
                              label="Before"
                              value={field.before}
                              tone="before"
                            />
                            <ValueBlock
                              label="After"
                              value={field.after}
                              tone="after"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {change.type === "added" && (
                    <p className="text-sm text-slate-600">
                      A new item was added to this section.
                    </p>
                  )}

                  {change.type === "removed" && (
                    <p className="text-sm text-slate-600">
                      This item was removed from the section.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </article>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore to draft?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace the current draft for {revision.subject}. The
              live site will not change until you publish from the editor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore} disabled={isRestoring}>
              {isRestoring ? "Restoring..." : "Restore to draft"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
