"use client";

import type { PaginationMeta } from "@/lib/pagination";
import type { AdminResourceSubject } from "@/types/resources2";
import SubjectList from "./components/SubjectList";

export default function ResourceCMSClient({
  initialSubjects,
  pagination,
}: {
  initialSubjects: AdminResourceSubject[];
  pagination: PaginationMeta;
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
        </p>
      </div>

      <SubjectList subjects={initialSubjects} pagination={pagination} />
    </div>
  );
}
