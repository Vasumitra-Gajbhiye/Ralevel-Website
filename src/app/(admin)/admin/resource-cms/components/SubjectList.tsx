"use client";

import type { PaginationMeta } from "@/lib/pagination";
import { Badge } from "@/components/ui/badge";
import { ListPagination } from "@/components/ui/list-pagination";
import type { AdminResourceSubject } from "@/types/resources2";
import { useRouter } from "next/navigation";

type SubjectListProps = {
  subjects: AdminResourceSubject[];
  pagination: PaginationMeta;
};

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SubjectList({
  subjects,
  pagination,
}: SubjectListProps) {
  const router = useRouter();

  function goToPage(page: number) {
    router.push(`/admin/resource-cms?page=${page}`);
  }

  if (subjects.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
        <p className="text-sm text-slate-500">No resource subjects found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {subjects.map((subject) => (
          <button
            key={subject._id}
            type="button"
            onClick={() => router.push(`/admin/resource-cms/${subject.slug}`)}
            className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {subject.subject}
                </h3>
                <p className="mt-1 text-sm text-slate-500">/{subject.slug}</p>
              </div>
              {subject.hasUnpublishedChanges ? (
                <Badge variant="secondary">Unpublished changes</Badge>
              ) : (
                <Badge variant="outline">Published</Badge>
              )}
            </div>
            <div className="mt-4 space-y-1 text-xs text-slate-500">
              <p>Last published: {formatDate(subject.publishedAt)}</p>
              <p>Draft updated: {formatDate(subject.draftUpdatedAt)}</p>
            </div>
          </button>
        ))}
      </div>

      <ListPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={goToPage}
      />
    </div>
  );
}
