"use client";

import type { PaginationMeta } from "@/lib/pagination";
import type { ResourceChangeRequestListItem } from "@/types/resourceChangeRequests";
import type { AdminResourceSubject } from "@/types/resources2";
import Link from "next/link";
import RequestStatusBadge from "./components/RequestStatusBadge";
import SubjectList from "./components/SubjectList";

export default function ResourceCMSClient({
  initialSubjects,
  pagination,
  canEditHomepage,
  needsReview,
  myRequests,
}: {
  initialSubjects: AdminResourceSubject[];
  pagination: PaginationMeta;
  canEditHomepage: boolean;
  needsReview: number;
  myRequests: ResourceChangeRequestListItem[];
}) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Resource CMS</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage syllabus, notes, worksheets, and tools for each subject.{" "}
          <a
            href="/admin/resource-cms/history"
            className="text-blue-600 hover:underline"
          >
            View history
          </a>
          {canEditHomepage && (
            <>
              {" · "}
              <a
                href="/admin/resource-cms/homepage"
                className="text-blue-600 hover:underline"
              >
                Edit resources page
              </a>
            </>
          )}
        </p>
      </div>

      {needsReview > 0 && (
        <Link
          href="/admin/resource-cms/requests?tab=needs-review"
          className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 hover:bg-amber-100"
        >
          <span>
            {needsReview} change request{needsReview === 1 ? "" : "s"} need
            {needsReview === 1 ? "s" : ""} review
          </span>
          <span className="font-medium">Review →</span>
        </Link>
      )}

      {myRequests.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white">
          <p className="border-b border-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
            Your requests
          </p>
          <ul className="divide-y divide-slate-100">
            {myRequests.map((r) => (
              <li key={r.number}>
                <Link
                  href={`/admin/resource-cms/requests/${r.number}`}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-slate-50"
                >
                  <span className="min-w-0 truncate text-slate-800">
                    <span className="text-slate-400">#{r.number}</span> {r.subject}: {r.title}
                  </span>
                  <RequestStatusBadge status={r.status} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <SubjectList subjects={initialSubjects} pagination={pagination} />
    </div>
  );
}
