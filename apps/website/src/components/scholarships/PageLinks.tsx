import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

/** Crawlable previous/next links; `hrefFor(page)` builds each URL. */
export default function PageLinks({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const linkClass =
    "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100";
  const disabledClass =
    "inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-300";

  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-between">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={linkClass}>
          <ChevronLeft className="h-4 w-4" /> Previous
        </Link>
      ) : (
        <span className={disabledClass}>
          <ChevronLeft className="h-4 w-4" /> Previous
        </span>
      )}
      <span className="text-sm text-slate-500">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={linkClass}>
          Next <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className={disabledClass}>
          Next <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
