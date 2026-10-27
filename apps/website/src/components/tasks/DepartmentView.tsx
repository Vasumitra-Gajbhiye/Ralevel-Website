"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { DepartmentPageData, DepartmentPersonRow } from "@/lib/data/tasks/lists";
import { tasksApi } from "@/lib/tasks/client";
import { STARS_PER_CERTIFICATE, starsTowardNext } from "@/lib/tasks/stars";
import type { TaskDTO } from "@/lib/tasks/types";
import { ChevronRight, Plus, Star } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ColorDot, EmptyState, UserAvatar } from "./bits";
import { ListFormDialog } from "./ListFormDialog";
import { TaskRow } from "./TaskRow";

function SectionHeading({ title, count }: { title: string; count?: number }) {
  return (
    <h2 className="mb-1 flex items-center gap-2 border-b border-gray-200 pb-1.5 text-sm font-semibold text-gray-800">
      {title}
      {count !== undefined && count > 0 && <span className="text-xs font-normal text-gray-400">{count}</span>}
    </h2>
  );
}

function TaskSection({ title, tasks, hint }: { title: string; tasks: TaskDTO[]; hint?: string }) {
  return (
    <section className="mb-10">
      <SectionHeading title={title} count={tasks.length} />
      {hint && <p className="py-1 text-xs text-gray-500">{hint}</p>}
      {tasks.map((t) => (
        <TaskRow key={t.id} task={t} showList />
      ))}
    </section>
  );
}

/** "★ 7 · 3 more to your next certificate", or a nudge when one is due. */
function MyStars({ standing }: { standing: NonNullable<DepartmentPageData["myStanding"]> }) {
  const left = STARS_PER_CERTIFICATE - starsTowardNext(standing.stars);
  return (
    <p className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-600">
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
      <span className="font-medium text-gray-900">{standing.stars}</span>
      {standing.due > 0 ? (
        <span>· you&apos;ve earned a certificate, and an admin will issue it soon</span>
      ) : (
        <span>
          · {left} more to your {standing.issued ? "next " : ""}certificate
        </span>
      )}
    </p>
  );
}

function MarkIssuedButton({ person, departmentKey }: { person: DepartmentPersonRow; departmentKey: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [certId, setCertId] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await tasksApi.markCertificateIssued({
        userId: person.user.id,
        departmentKey,
        certId: certId.trim() || undefined,
      });
      toast.success(`Marked a certificate as issued for ${person.user.name}`);
      setOpen(false);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setOpen(true)}>
        Mark issued
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm tracking-normal">
          <DialogHeader>
            <DialogTitle>Certificate issued?</DialogTitle>
            <DialogDescription>
              Issue it in Admin → Certificates first. Marking it here uses up {STARS_PER_CERTIFICATE} of{" "}
              {person.user.name}&apos;s stars.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
            className="space-y-4"
          >
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-gray-600">Certificate ID (optional)</span>
              <Input value={certId} maxLength={100} onChange={(e) => setCertId(e.target.value)} />
            </label>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                Mark issued
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function DepartmentView({ data }: { data: DepartmentPageData }) {
  const { department, canManage, canIssueCertificates, lists, archived, people, unassignedOpen } = data;
  const { upForGrabs, awaitingReview, myStanding } = data;
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

      {myStanding && <MyStars standing={myStanding} />}

      {canManage && awaitingReview.length > 0 && <TaskSection title="Waiting for review" tasks={awaitingReview} />}

      {upForGrabs.length > 0 && (
        <TaskSection
          title="Up for grabs"
          tasks={upForGrabs}
          hint={canManage ? undefined : "Claim one to make it yours. Tasks with stars count toward a certificate."}
        />
      )}

      <section>
        <SectionHeading title="Lists" />
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
          <SectionHeading title="Team" />
          {people.length === 0 ? (
            <p className="py-3 text-sm text-gray-500">No one has tasks assigned in this department yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500">
                  <th className="py-2 font-normal">Person</th>
                  <th className="w-14 py-2 text-right font-normal">Open</th>
                  <th className="hidden w-20 py-2 text-right font-normal sm:table-cell">Overdue</th>
                  <th className="hidden w-24 py-2 text-right font-normal sm:table-cell">Done (7d)</th>
                  <th className="w-14 py-2 text-right font-normal">Stars</th>
                </tr>
              </thead>
              <tbody>
                {people.map((p) => (
                  <tr key={p.user.id} className="border-t border-gray-100">
                    <td className="py-2">
                      <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                        <UserAvatar user={p.user} size={22} />
                        <span className="truncate">{p.user.name}</span>
                        {p.certificatesDue > 0 && (
                          <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">
                            Certificate due{p.certificatesDue > 1 ? ` ×${p.certificatesDue}` : ""}
                          </span>
                        )}
                        {p.certificatesDue > 0 && canIssueCertificates && (
                          <MarkIssuedButton person={p} departmentKey={department.key} />
                        )}
                      </span>
                    </td>
                    <td className="py-2 text-right tabular-nums">{p.open}</td>
                    <td
                      className={`hidden py-2 text-right tabular-nums sm:table-cell ${p.overdue ? "font-medium text-red-600" : "text-gray-400"}`}
                    >
                      {p.overdue}
                    </td>
                    <td className="hidden py-2 text-right tabular-nums text-gray-600 sm:table-cell">{p.doneThisWeek}</td>
                    <td className={`py-2 text-right tabular-nums ${p.stars ? "text-amber-700" : "text-gray-400"}`}>{p.stars}</td>
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
