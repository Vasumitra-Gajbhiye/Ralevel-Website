"use client";

import { Button } from "@/components/ui/button";
import type { DepartmentPageData } from "@/lib/data/tasks/lists";
import { tasksApi } from "@/lib/tasks/client";
import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ColorDot, EmptyState, UserAvatar } from "./bits";
import { ListFormDialog } from "./ListFormDialog";

export function DepartmentView({ data }: { data: DepartmentPageData }) {
  const { department, canManage, lists, archived, people, unassignedOpen } = data;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [creating, setCreating] = useState(searchParams.get("new") === "1" && canManage);

  const unarchive = async (id: string) => {
    try {
      await tasksApi.updateList(id, { archived: false });
      toast.success("List restored");
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
      <header className="mb-6 flex items-center gap-3">
        <div>
          <p className="text-xs text-gray-500">Department</p>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
            <ColorDot color={department.color} className="h-2.5 w-2.5" />
            {department.name}
          </h1>
        </div>
        {canManage && (
          <Button size="sm" className="ml-auto gap-1.5" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> New list
          </Button>
        )}
      </header>

      <section>
        <h2 className="mb-1 border-b border-gray-200 pb-1.5 text-sm font-semibold text-gray-800">Lists</h2>
        {lists.length === 0 ? (
          <EmptyState
            title="No lists yet"
            hint={canManage ? "Create a list to start adding and assigning tasks." : "Your department head hasn't created any lists yet."}
          />
        ) : (
          <ul>
            {lists.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/tasks/l/${l.id}`}
                  className="group flex items-center gap-3 border-b border-gray-100 px-1 py-2.5 hover:bg-gray-50"
                >
                  <ColorDot color={l.color} />
                  <span className="flex-1 truncate text-sm text-gray-900">{l.name}</span>
                  {l.overdueCount > 0 && <span className="text-xs font-medium text-red-600">{l.overdueCount} overdue</span>}
                  <span className="w-8 text-right text-xs text-gray-400">{l.openCount || ""}</span>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {canManage && (
        <section className="mt-10">
          <h2 className="mb-1 border-b border-gray-200 pb-1.5 text-sm font-semibold text-gray-800">Team</h2>
          {people.length === 0 ? (
            <p className="py-3 text-sm text-gray-500">No one has tasks assigned in this department yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500">
                  <th className="py-2 font-normal">Person</th>
                  <th className="w-16 py-2 text-right font-normal">Open</th>
                  <th className="w-20 py-2 text-right font-normal">Overdue</th>
                  <th className="w-24 py-2 text-right font-normal">Done (7d)</th>
                </tr>
              </thead>
              <tbody>
                {people.map((p) => (
                  <tr key={p.user.id} className="border-t border-gray-100">
                    <td className="py-2">
                      <span className="flex items-center gap-2">
                        <UserAvatar user={p.user} size={22} />
                        <span className="truncate">{p.user.name}</span>
                      </span>
                    </td>
                    <td className="py-2 text-right tabular-nums">{p.open}</td>
                    <td className={`py-2 text-right tabular-nums ${p.overdue ? "font-medium text-red-600" : "text-gray-400"}`}>
                      {p.overdue}
                    </td>
                    <td className="py-2 text-right tabular-nums text-gray-600">{p.doneThisWeek}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {unassignedOpen > 0 && (
            <p className="mt-2 text-xs text-gray-500">
              {unassignedOpen} open task{unassignedOpen === 1 ? "" : "s"} not assigned to anyone.
            </p>
          )}
        </section>
      )}

      {canManage && archived.length > 0 && (
        <details className="mt-10">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-800">Archived lists ({archived.length})</summary>
          <ul className="mt-2">
            {archived.map((l) => (
              <li key={l.id} className="flex items-center gap-3 border-b border-gray-100 px-1 py-2">
                <ColorDot color={l.color} />
                <Link href={`/tasks/l/${l.id}`} className="flex-1 truncate text-sm text-gray-600 hover:underline">
                  {l.name}
                </Link>
                <Button variant="ghost" size="sm" onClick={() => void unarchive(l.id)}>
                  Unarchive
                </Button>
              </li>
            ))}
          </ul>
        </details>
      )}

      <ListFormDialog
        open={creating}
        onOpenChange={setCreating}
        departmentKey={department.key}
        departmentName={department.name}
      />
    </div>
  );
}
