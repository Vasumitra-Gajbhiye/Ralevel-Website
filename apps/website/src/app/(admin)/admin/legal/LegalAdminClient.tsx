"use client";

import { Button } from "@/components/ui/button";
import type { AdminLegalPageListItem } from "@/lib/data/admin/legalPages";
import { Pencil } from "lucide-react";
import Link from "next/link";

export default function LegalAdminClient({
  initialPages,
}: {
  initialPages: AdminLegalPageListItem[];
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Legal pages</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Edit the site’s static legal copy. Saving creates a draft; publishing
          updates the live page and the Last updated date.
        </p>
      </div>

      <div className="space-y-3">
        {initialPages.map((page) => (
          <div
            key={page.slug}
            className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-neutral-900">
                {page.title}
              </p>
              <p className="truncate text-sm text-neutral-500">{page.path}</p>
              <p className="mt-1 text-xs text-neutral-400">
                {page.lastPublishedLabel
                  ? `Last published ${page.lastPublishedLabel}`
                  : "Not published yet"}
                {page.hasDraft ? " · Unpublished changes" : ""}
              </p>
            </div>
            {page.hasDraft && (
              <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                Draft
              </span>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/legal/${page.slug}`}>
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
