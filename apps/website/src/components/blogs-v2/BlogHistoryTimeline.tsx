"use client";

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
import type {
  BlogV2HistoryTimelineItem,
  BlogV2VersionSummary,
} from "@/types/blogV2";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

function actionLabel(action: BlogV2HistoryTimelineItem["action"]): string {
  switch (action) {
    case "submitted":
      return "Submitted for review";
    case "approved":
      return "Approved";
    case "rejected":
      return "Changes requested";
    case "restored":
      return "Restored to draft";
    default:
      return action;
  }
}

function actionBadgeVariant(
  action: BlogV2HistoryTimelineItem["action"],
): "default" | "secondary" | "outline" | "destructive" {
  switch (action) {
    case "approved":
      return "default";
    case "rejected":
      return "outline";
    case "restored":
      return "secondary";
    default:
      return "secondary";
  }
}

function TimelineEventCard({
  blogId,
  item,
  onRestored,
}: {
  blogId: string;
  item: BlogV2HistoryTimelineItem;
  onRestored: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const previewSubmissionHref = item.hasSubmissionSnapshot
    ? `/blogs/v2/preview/${blogId}?eventId=${item._id}`
    : null;
  const previewVersionHref = item.versionId
    ? `/blogs/v2/preview/${blogId}?versionId=${item.versionId}`
    : null;

  async function handleRestore() {
    if (!item.versionId) return;
    setRestoring(true);
    try {
      const res = await fetch(
        `/api/admin/blogs/v2/${blogId}/versions/${item.versionId}/restore`,
        { method: "POST" },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to restore version");
      }
      toast.success("Version restored to draft. Reloading editor…");
      setConfirmOpen(false);
      onRestored();
      window.location.reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to restore version",
      );
    } finally {
      setRestoring(false);
    }
  }

  return (
    <>
      <article className="relative pl-6 pb-8 last:pb-0">
        <div className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-neutral-400 ring-4 ring-white" />
        <div className="absolute left-[4px] top-4 bottom-0 w-px bg-neutral-200 last:hidden" />

        <div className="rounded-lg border border-neutral-200 bg-white p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={actionBadgeVariant(item.action)}>
              {actionLabel(item.action)}
            </Badge>
            {item.versionNumber && item.action === "approved" && (
              <Badge variant="outline">Version {item.versionNumber}</Badge>
            )}
            {item.reviewType && (
              <Badge variant="outline" className="capitalize">
                {item.reviewType}
              </Badge>
            )}
          </div>

          <div className="text-sm text-neutral-600">
            <span className="font-medium text-neutral-900">{item.actorName}</span>
            <span className="text-neutral-400"> · </span>
            <span>{item.createdAtLabel}</span>
          </div>

          {item.action === "approved" && (
            <p className="text-sm text-neutral-700">
              Approved by {item.actorName}
              {item.versionNumber ? ` — version ${item.versionNumber} published` : ""}
            </p>
          )}

          {item.action === "rejected" && item.note && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <p className="font-medium mb-1">Feedback</p>
              <p className="whitespace-pre-wrap">{item.note}</p>
            </div>
          )}

          {item.action === "restored" && item.versionNumber && (
            <p className="text-sm text-neutral-700">
              Restored version {item.versionNumber} into the working draft.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {previewSubmissionHref && (
              <Button size="sm" variant="outline" asChild>
                <Link href={previewSubmissionHref} target="_blank">
                  View submission
                </Link>
              </Button>
            )}
            {previewVersionHref && (
              <Button size="sm" variant="outline" asChild>
                <Link href={previewVersionHref} target="_blank">
                  View version
                </Link>
              </Button>
            )}
            {item.versionId && item.action === "approved" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmOpen(true)}
                disabled={restoring}
              >
                Restore to draft
              </Button>
            )}
          </div>
        </div>
      </article>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore this version?</AlertDialogTitle>
            <AlertDialogDescription>
              This will load version {item.versionNumber} into your working draft.
              The live post will not change until you submit and get approval again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore} disabled={restoring}>
              {restoring ? "Restoring…" : "Restore to draft"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function BlogHistoryTimeline({
  blogId,
  timeline,
  versions,
  onRestored,
}: {
  blogId: string;
  timeline: BlogV2HistoryTimelineItem[];
  versions: BlogV2VersionSummary[];
  onRestored: () => void;
}) {
  if (timeline.length === 0 && versions.length === 0) {
    return (
      <p className="text-sm text-neutral-500 py-8 text-center">
        No history yet. Submit this blog for review to start the timeline.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {versions.length > 0 && (
        <div className="mb-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-sm font-medium text-neutral-900 mb-2">
            Published versions
          </p>
          <p className="text-sm text-neutral-600">
            {versions.length} version{versions.length === 1 ? "" : "s"} saved
            {versions[0] ? ` — latest is v${versions[0].versionNumber}` : ""}
          </p>
        </div>
      )}

      <div className="relative">
        {timeline.map((item) => (
          <TimelineEventCard
            key={item._id}
            blogId={blogId}
            item={item}
            onRestored={onRestored}
          />
        ))}
      </div>
    </div>
  );
}
