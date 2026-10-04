"use client";

import { ArrowUpRight } from "lucide-react";
import posthog from "posthog-js";
import { SaveButton } from "./SaveState";

/** Save + Apply, always within reach. Pages using it need bottom padding. */
export default function StickyApplyBar({
  scholarshipId,
  applyUrl,
  deadlineLabel,
}: {
  scholarshipId: string;
  applyUrl: string;
  deadlineLabel: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 tracking-normal">
      <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-xl border border-slate-200 bg-white/95 px-3 py-3 shadow-lg backdrop-blur sm:px-4">
        <SaveButton variant="button" />
        <p className="hidden min-w-0 flex-1 truncate text-sm text-slate-500 sm:block">
          {deadlineLabel}
        </p>
        {applyUrl && (
          <a
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              posthog.capture("scholarship_apply_clicked", { scholarship_id: scholarshipId })
            }
            className="ml-auto inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 sm:flex-none"
          >
            Apply on official site
            <ArrowUpRight className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
}
