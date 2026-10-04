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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ListPagination } from "@/components/ui/list-pagination";
import type { AdminUniversityRow, AdminView } from "@/lib/data/admin/scholarships";
import type { PaginationMeta } from "@/lib/pagination";
import { countryName } from "@/lib/scholarships/countries";
import { formatDate } from "@/lib/scholarships/format";
import { MoreHorizontal, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import ImportDialog from "./ImportDialog";
import ListToolbar from "./ListToolbar";
import StatusBadge from "./StatusBadge";

const VIEWS = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
  { value: "verify", label: "Needs verifying" },
  { value: "archived", label: "Archived" },
];

type RowAction = "verify" | "publish" | "unpublish" | "archive";

export default function UniversitiesAdminClient({
  rows,
  pagination,
  q,
  view,
}: {
  rows: AdminUniversityRow[];
  pagination: PaginationMeta;
  q: string;
  view: AdminView;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [deleting, setDeleting] = useState<AdminUniversityRow | null>(null);

  async function act(id: string, action: RowAction) {
    const res = await fetch(`/api/admin/scholarships/universities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json().catch(() => null);
    if (res.ok) {
      toast.success("Done");
      router.refresh();
    } else toast.error(data?.error || "Action failed");
  }

  async function confirmDelete() {
    if (!deleting) return;
    const res = await fetch(`/api/admin/scholarships/universities/${deleting.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("Deleted");
      router.refresh();
    } else toast.error("Couldn't delete");
    setDeleting(null);
  }

  return (
    <div className="space-y-5">
      <ListToolbar q={q} view={view} views={VIEWS}>
        <ImportDialog kind="universities" />
        <Button asChild size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
          <Link href="/admin/scholarships/universities/new">
            <Plus /> New
          </Link>
        </Button>
      </ListToolbar>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {rows.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500">
            {q || view !== "all" ? "Nothing matches." : "No universities yet."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-2 py-2.5">Status</th>
                <th className="hidden px-2 py-2.5 md:table-cell">Verified</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60">
                  <td className="max-w-0 px-4 py-3">
                    <Link
                      href={`/admin/scholarships/universities/${row.id}`}
                      className="block truncate font-medium text-slate-900 hover:text-blue-600"
                    >
                      {row.name}
                    </Link>
                    <p className="text-xs text-slate-500">{countryName(row.country)}</p>
                  </td>
                  <td className="px-2 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="hidden whitespace-nowrap px-2 py-3 text-slate-500 md:table-cell">
                    {row.needsVerification ? (
                      <span className="text-amber-700">Needs check</span>
                    ) : row.lastVerifiedAt ? (
                      formatDate(row.lastVerifiedAt, { withYear: true })
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-2 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          aria-label="Actions"
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="tracking-normal">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/scholarships/universities/${row.id}`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a
                            href={`/scholarships/universities/${row.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View page
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {row.status === "published" ? (
                          <DropdownMenuItem onSelect={() => act(row.id, "unpublish")}>
                            Unpublish
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onSelect={() => act(row.id, "publish")}>
                            Publish
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onSelect={() => act(row.id, "verify")}>
                          Mark verified
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {row.status !== "archived" && (
                          <DropdownMenuItem onSelect={() => act(row.id, "archive")}>
                            Archive
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onSelect={() => setDeleting(row)}
                          className="text-red-600 focus:text-red-700"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ListPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(page) => {
          const params = new URLSearchParams();
          if (q) params.set("q", q);
          if (view !== "all") params.set("view", view);
          params.set("page", String(page));
          router.push(`${pathname}?${params}`);
        }}
      />

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent className="tracking-normal">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this university?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleting?.name}&rdquo; will be removed and unlinked from its scholarships.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
