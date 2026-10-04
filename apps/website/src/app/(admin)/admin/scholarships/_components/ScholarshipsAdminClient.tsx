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
import type {
  AdminScholarshipRow,
  AdminView,
  AttentionCounts,
} from "@/lib/data/admin/scholarships";
import type { PaginationMeta } from "@/lib/pagination";
import { formatDate } from "@/lib/scholarships/format";
import { getDeadlineState } from "@/lib/scholarships/status";
import { cn } from "@/lib/utils";
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
  { value: "past", label: "Past deadline" },
  { value: "verify", label: "Needs verifying" },
  { value: "archived", label: "Archived" },
];

type RowAction = "verify" | "rollover" | "publish" | "unpublish" | "archive" | "duplicate";

export default function ScholarshipsAdminClient({
  rows,
  pagination,
  q,
  view,
  attention,
}: {
  rows: AdminScholarshipRow[];
  pagination: PaginationMeta;
  q: string;
  view: AdminView;
  attention: AttentionCounts;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<AdminScholarshipRow | null>(null);

  async function act(id: string, action: RowAction) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/scholarships/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Action failed");
      if (action === "duplicate") {
        router.push(`/admin/scholarships/${data.data.id}`);
        return;
      }
      toast.success("Done");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  async function bulk(action: "publish" | "unpublish" | "archive") {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/scholarships/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected, action }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Action failed");
      if (data.skipped?.length) {
        toast.warning(`${data.done} updated, ${data.skipped.length} skipped: ${data.skipped[0]}`);
      } else {
        toast.success(`${data.done} updated`);
      }
      setSelected([]);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    const res = await fetch(`/api/admin/scholarships/${deleting.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Deleted");
      router.refresh();
    } else toast.error("Couldn't delete");
    setDeleting(null);
  }

  const attentionParts = [
    attention.past > 0 && { href: `${pathname}?view=past`, label: `${attention.past} past deadline` },
    attention.verify > 0 && {
      href: `${pathname}?view=verify`,
      label: `${attention.verify} need verifying`,
    },
    attention.submissions > 0 && {
      href: "/admin/scholarships/submissions",
      label: `${attention.submissions} new ${attention.submissions === 1 ? "submission" : "submissions"}`,
    },
  ].filter((p): p is { href: string; label: string } => Boolean(p));

  const allSelected = rows.length > 0 && selected.length === rows.length;

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600">
        {attentionParts.length === 0 ? (
          "Nothing needs attention."
        ) : (
          <>
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-amber-500" />
            {attentionParts.map((part, i) => (
              <span key={part.href}>
                {i > 0 && " · "}
                <Link href={part.href} className="font-medium text-slate-900 hover:underline">
                  {part.label}
                </Link>
              </span>
            ))}
          </>
        )}
      </p>

      <ListToolbar q={q} view={view} views={VIEWS}>
        <ImportDialog kind="scholarships" />
        <Button asChild size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
          <Link href="/admin/scholarships/new">
            <Plus /> New
          </Link>
        </Button>
      </ListToolbar>

      {selected.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">
          <span className="flex-1">{selected.length} selected</span>
          <button type="button" disabled={busy} onClick={() => bulk("publish")} className="px-2 hover:underline">
            Publish
          </button>
          <button type="button" disabled={busy} onClick={() => bulk("unpublish")} className="px-2 hover:underline">
            Unpublish
          </button>
          <button type="button" disabled={busy} onClick={() => bulk("archive")} className="px-2 hover:underline">
            Archive
          </button>
          <button type="button" onClick={() => setSelected([])} className="px-2 text-slate-400 hover:text-white">
            Clear
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {rows.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500">
            {q || view !== "all" ? "Nothing matches." : "No scholarships yet."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="w-10 px-4 py-2.5">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={allSelected}
                    onChange={() => setSelected(allSelected ? [] : rows.map((r) => r.id))}
                    className="h-4 w-4 accent-blue-600"
                  />
                </th>
                <th className="px-2 py-2.5">Title</th>
                <th className="hidden px-2 py-2.5 sm:table-cell">Deadline</th>
                <th className="px-2 py-2.5">Status</th>
                <th className="hidden px-2 py-2.5 md:table-cell">Verified</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => {
                const deadline = getDeadlineState(row);
                return (
                  <tr key={row.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label={`Select ${row.title}`}
                        checked={selected.includes(row.id)}
                        onChange={() =>
                          setSelected((s) =>
                            s.includes(row.id) ? s.filter((x) => x !== row.id) : [...s, row.id],
                          )
                        }
                        className="h-4 w-4 accent-blue-600"
                      />
                    </td>
                    <td className="max-w-0 px-2 py-3">
                      <Link
                        href={`/admin/scholarships/${row.id}`}
                        className="block truncate font-medium text-slate-900 hover:text-blue-600"
                      >
                        {row.title}
                      </Link>
                      <p className="truncate text-xs text-slate-500">{row.provider}</p>
                    </td>
                    <td
                      className={cn(
                        "hidden whitespace-nowrap px-2 py-3 sm:table-cell",
                        deadline.kind === "closed" && row.status === "published"
                          ? "text-amber-700"
                          : "text-slate-600",
                      )}
                    >
                      {deadline.label}
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
                            disabled={busy}
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="tracking-normal">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/scholarships/${row.id}`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={`/scholarships/${row.slug}`} target="_blank" rel="noopener noreferrer">
                              View page
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => act(row.id, "duplicate")}>
                            Duplicate
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
                          {row.recurring && row.deadline && (
                            <DropdownMenuItem onSelect={() => act(row.id, "rollover")}>
                              Roll over to next cycle
                            </DropdownMenuItem>
                          )}
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
                );
              })}
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
            <AlertDialogTitle>Delete this scholarship?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleting?.title}&rdquo; will be removed for good, along with every
              student&apos;s saved progress on it. Archive it instead if you might need it again.
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
