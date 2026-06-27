"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListPagination } from "@/components/ui/list-pagination";
import type { BlogV2GlobalHistoryEntry } from "@/types/blogV2";
import type { PaginationMeta } from "@/lib/pagination";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function actionLabel(action: BlogV2GlobalHistoryEntry["action"]): string {
  switch (action) {
    case "submitted":
      return "Submitted";
    case "approved":
      return "Approved";
    case "rejected":
      return "Changes requested";
    case "restored":
      return "Restored";
    default:
      return action;
  }
}

function GlobalHistoryRow({ entry }: { entry: BlogV2GlobalHistoryEntry }) {
  const [expanded, setExpanded] = useState(false);
  const previewSubmissionHref = entry.hasSubmissionSnapshot
    ? `/blogs/v2/preview/${entry.blogId}?eventId=${entry._id}`
    : null;
  const previewVersionHref = entry.versionId
    ? `/blogs/v2/preview/${entry.blogId}?versionId=${entry.versionId}`
    : null;

  return (
    <article className="border rounded-xl p-4 bg-white space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/admin/blogs/v2/${entry.blogId}/edit`}
            className="font-medium text-gray-900 hover:text-blue-600 truncate block"
          >
            {entry.blogTitle}
          </Link>
          <div className="text-sm text-gray-500 mt-1">
            {entry.actorName} · {entry.createdAtLabel}
          </div>
        </div>
        <Badge variant="outline">{actionLabel(entry.action)}</Badge>
      </div>

      {entry.action === "approved" && entry.versionNumber && (
        <p className="text-sm text-neutral-700">
          Approved by {entry.actorName} — version {entry.versionNumber} published
        </p>
      )}

      {entry.action === "rejected" && entry.note && (
        <div>
          <p
            className={`text-sm text-neutral-600 ${
              expanded ? "whitespace-pre-wrap" : "line-clamp-2"
            }`}
          >
            {entry.note}
          </p>
          {entry.note.length > 120 && (
            <button
              type="button"
              className="text-xs text-blue-600 hover:underline mt-1"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}

      {entry.action === "restored" && entry.versionNumber && (
        <p className="text-sm text-neutral-700">
          Restored version {entry.versionNumber} to draft
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="ghost" asChild>
          <Link href={`/admin/blogs/v2/${entry.blogId}/edit`}>Open editor</Link>
        </Button>
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
      </div>
    </article>
  );
}

export default function BlogGlobalHistoryTab({
  entries,
  pagination,
}: {
  entries: BlogV2GlobalHistoryEntry[];
  pagination: PaginationMeta;
}) {
  const router = useRouter();

  if (entries.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No review history yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <GlobalHistoryRow key={entry._id} entry={entry} />
      ))}
      <ListPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(nextPage) => {
          const params = new URLSearchParams(window.location.search);
          params.set("tab", "history");
          params.set("page", String(nextPage));
          router.push(`/admin/all-blogs?${params.toString()}`);
        }}
      />
    </div>
  );
}
