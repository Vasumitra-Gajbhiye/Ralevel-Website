"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  copyRoleAccess,
  diffAccessMaps,
  resetRole,
  resetSection,
} from "@/lib/admin-access/diff";
import {
  applyChanges,
  resolveAccessMap,
  sectionsForRoles,
  type AccessMap,
} from "@/lib/admin-access/resolve";
import {
  ADMIN_AREAS,
  ADMIN_SECTIONS,
  type AdminSectionKey,
} from "@/lib/admin-access/sections";
import type { PermissionsPageData } from "@/lib/data/admin/permissions";
import { ROLE_LABELS, ROLE_UI_GROUPS } from "@/lib/role-labels";
import type { Role } from "@/lib/roles";
import { History } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CopyAccessDialog } from "./CopyAccessDialog";
import { HistorySheet, type HistoryFilter } from "./HistorySheet";
import { PagePanel } from "./PagePanel";
import { ReviewDialog, type SaveOutcome } from "./ReviewDialog";
import { RolePanel } from "./RolePanel";
import { SideList, type SideListGroup } from "./SideList";
import { UnsavedBar } from "./UnsavedBar";
import { actorName, countPeopleByRole, peopleLabel, timeAgo } from "./shared";

export type PermissionsView = "role" | "page";

export default function PermissionsClient({
  initial,
  actorRoles,
  initialView,
  initialRole,
  initialSection,
}: {
  initial: PermissionsPageData;
  actorRoles: Role[];
  initialView: PermissionsView;
  initialRole: Role;
  initialSection: AdminSectionKey;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initial);
  const savedMap = useMemo(() => resolveAccessMap(saved.overrides), [saved]);
  const [draft, setDraft] = useState<AccessMap>(savedMap);
  const pending = useMemo(() => diffAccessMaps(savedMap, draft), [savedMap, draft]);

  const [view, setView] = useState<PermissionsView>(initialView);
  const [role, setRole] = useState<Role>(initialRole);
  const [section, setSection] = useState<AdminSectionKey>(initialSection);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>(null);
  const [savedCount, setSavedCount] = useState(0);

  const peopleByRole = useMemo(() => countPeopleByRole(saved.roleCombos), [saved]);

  // Keep the view linkable without a server round trip.
  useEffect(() => {
    const params = new URLSearchParams({ view });
    if (view === "role") params.set("role", role);
    else params.set("page", section);
    window.history.replaceState(null, "", `?${params}`);
  }, [view, role, section]);

  useEffect(() => {
    if (pending.length === 0) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [pending.length]);

  const roleGroups: SideListGroup[] = ROLE_UI_GROUPS.map((group) => ({
    label: group.label,
    items: group.roles.map((r) => {
      const pages = sectionsForRoles(draft, [r]).length;
      const people = peopleByRole.get(r) ?? 0;
      return {
        id: r,
        label: ROLE_LABELS[r],
        meta:
          r === "owner"
            ? "Every page"
            : `${pages === 1 ? "1 page" : `${pages} pages`} · ${peopleLabel(people)}`,
        pending: pending.some((change) => change.role === r),
      };
    }),
  }));

  const pageGroups: SideListGroup[] = ADMIN_AREAS.map((area) => ({
    label: area.label,
    items: ADMIN_SECTIONS.filter((s) => s.area === area.key).map((s) => {
      const roles = draft[s.key].length;
      return {
        id: s.key,
        label: s.label,
        meta: `${roles === 1 ? "1 role" : `${roles} roles`}${s.lock ? " · locked" : ""}`,
        pending: pending.some((change) => change.section === s.key),
      };
    }),
  })).filter((group) => group.items.length > 0);

  function toggle(sectionKey: AdminSectionKey, forRole: Role, granted: boolean) {
    setDraft((current) => applyChanges(current, [{ section: sectionKey, role: forRole, granted }]));
  }

  function openHistory(filter: HistoryFilter) {
    setHistoryFilter(filter);
    setHistoryOpen(true);
  }

  async function save(note: string): Promise<SaveOutcome> {
    const res = await fetch("/api/admin/permissions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        baseVersion: saved.version,
        changes: pending,
        ...(note ? { note } : {}),
      }),
    });

    if (res.status === 409) {
      const body = (await res.json()) as { latest: PermissionsPageData };
      return { kind: "conflict", latest: body.latest };
    }
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      toast.error(body?.error ?? "Couldn't save page access. Try again.");
      throw new Error("save failed");
    }

    const body = (await res.json()) as { data: PermissionsPageData; applied: unknown[] };
    setSaved(body.data);
    setDraft(resolveAccessMap(body.data.overrides));
    setSavedCount((n) => n + 1);
    toast.success("Page access updated", {
      description:
        body.applied.length === 1 ? "1 change saved." : `${body.applied.length} changes saved.`,
    });
    // Refresh server components so the editor's own sidebar reflects the change.
    router.refresh();
    return { kind: "saved" };
  }

  function reapplyOnto(latest: PermissionsPageData) {
    setSaved(latest);
    setDraft(applyChanges(resolveAccessMap(latest.overrides), pending));
    toast.info("Loaded the latest page access and re-applied your changes.");
  }

  const mobilePicker =
    view === "role" ? (
      <Select value={role} onValueChange={(value) => setRole(value as Role)}>
        <SelectTrigger aria-label="Role">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLE_UI_GROUPS.map((group) => (
            <SelectGroup key={group.label}>
              <SelectLabel>{group.label}</SelectLabel>
              {group.roles.map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_LABELS[r]}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    ) : (
      <Select value={section} onValueChange={(value) => setSection(value as AdminSectionKey)}>
        <SelectTrigger aria-label="Page">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {pageGroups.map((group) => (
            <SelectGroup key={group.label}>
              <SelectLabel>{group.label}</SelectLabel>
              {group.items.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    );

  return (
    <div className="mx-auto max-w-5xl pb-28 tracking-normal">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Page access</h1>
          <p className="mt-1 text-sm text-slate-500">
            Choose which roles can open each admin page.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {saved.updatedAt ? (
              <>
                Last changed {timeAgo(saved.updatedAt)} by {actorName(saved.updatedBy)}
              </>
            ) : (
              "Every page uses its default access."
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(value) => setView(value as PermissionsView)}>
            <TabsList>
              <TabsTrigger value="role">By role</TabsTrigger>
              <TabsTrigger value="page">By page</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" onClick={() => openHistory(null)}>
            <History className="mr-1.5 h-4 w-4" /> History
          </Button>
        </div>
      </header>

      <div className="mt-6 grid gap-6 md:grid-cols-[15rem_minmax(0,1fr)]">
        <div className="md:hidden">{mobilePicker}</div>
        <aside className="hidden md:block">
          <div className="sticky top-0">
            {view === "role" ? (
              <SideList
                key="roles"
                groups={roleGroups}
                selectedId={role}
                onSelect={(id) => setRole(id as Role)}
                searchLabel="Search roles"
                emptyLabel="No roles match"
              />
            ) : (
              <SideList
                key="pages"
                groups={pageGroups}
                selectedId={section}
                onSelect={(id) => setSection(id as AdminSectionKey)}
                searchLabel="Search pages"
                emptyLabel="No pages match"
              />
            )}
          </div>
        </aside>

        <section aria-label={view === "role" ? "Pages for this role" : "Roles for this page"}>
          {view === "role" ? (
            <RolePanel
              role={role}
              draft={draft}
              savedMap={savedMap}
              people={peopleByRole.get(role) ?? 0}
              lastChange={saved.lastChange.byRole[role]}
              onToggle={(key, granted) => toggle(key, role, granted)}
              onCopy={() => setCopyOpen(true)}
              onReset={() => setDraft((current) => resetRole(current, role))}
              onHistory={() => openHistory({ role })}
            />
          ) : (
            <PagePanel
              sectionKey={section}
              draft={draft}
              savedMap={savedMap}
              peopleByRole={peopleByRole}
              lastChange={saved.lastChange.bySection[section]}
              onToggle={(r, granted) => toggle(section, r, granted)}
              onReset={() => setDraft((current) => resetSection(current, section))}
              onHistory={() => openHistory({ section })}
            />
          )}
        </section>
      </div>

      <UnsavedBar
        count={pending.length}
        onDiscard={() => setDraft(savedMap)}
        onReview={() => setReviewOpen(true)}
      />

      <ReviewDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        changes={pending}
        before={savedMap}
        after={draft}
        combos={saved.roleCombos}
        peopleByRole={peopleByRole}
        actorRoles={actorRoles}
        onSave={save}
        onReapply={reapplyOnto}
      />

      <CopyAccessDialog
        target={role}
        draft={draft}
        open={copyOpen}
        onOpenChange={setCopyOpen}
        onCopy={(from) => setDraft((current) => copyRoleAccess(current, from, role))}
      />

      <HistorySheet
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        filter={historyFilter}
        onClearFilter={() => setHistoryFilter(null)}
        refreshKey={savedCount}
      />
    </div>
  );
}
