"use client";

import { ROLE_META } from "@/components/admin/roleMeta";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { isCustomized, type AccessMap } from "@/lib/admin-access/resolve";
import {
  ADMIN_AREAS,
  ADMIN_SECTIONS,
  getAdminSection,
  type AdminSectionDef,
  type AdminSectionKey,
} from "@/lib/admin-access/sections";
import type { ChangeStamp } from "@/lib/data/admin/permissions";
import { ROLE_LABELS } from "@/lib/role-labels";
import type { Role } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { Copy, History, Lock, MoreHorizontal, RotateCcw } from "lucide-react";
import Link from "next/link";
import {
  InPageRules,
  PendingDot,
  actorName,
  peopleLabel,
  timeAgo,
} from "./shared";

export function RoleBadge({ role }: { role: Role }) {
  const meta = ROLE_META[role];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-medium",
        meta.color,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {ROLE_LABELS[role]}
    </span>
  );
}

function lockedReason(section: AdminSectionDef, role: Role, draft: AccessMap) {
  if (section.lock) return section.lock.note;
  if (section.requires && !draft[section.requires].includes(role)) {
    return `Turn on ${getAdminSection(section.requires).label} first.`;
  }
  return null;
}

export function RolePanel({
  role,
  draft,
  savedMap,
  people,
  lastChange,
  onToggle,
  onCopy,
  onReset,
  onHistory,
}: {
  role: Role;
  draft: AccessMap;
  savedMap: AccessMap;
  people: number;
  lastChange?: ChangeStamp;
  onToggle: (section: AdminSectionKey, granted: boolean) => void;
  onCopy: () => void;
  onReset: () => void;
  onHistory: () => void;
}) {
  const isOwner = role === "owner";
  const customized = isCustomized(draft, { role });
  const openCount = ADMIN_SECTIONS.filter((s) => draft[s.key].includes(role)).length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <RoleBadge role={role} />
            {customized && <Badge variant="secondary">Customized</Badge>}
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {people > 0 ? peopleLabel(people) : "No one has this role yet"}
            {lastChange && (
              <>
                {" · "}Changed {timeAgo(lastChange.at)} by {actorName(lastChange.by)}
              </>
            )}
          </p>
        </div>
        {!isOwner && (
          // Non-modal so the dialog or sheet it opens gets focus cleanly.
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`More actions for ${ROLE_LABELS[role]}`}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={onCopy}>
                <Copy className="mr-2 h-4 w-4" /> Copy access from…
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onReset} disabled={!customized}>
                <RotateCcw className="mr-2 h-4 w-4" /> Reset to default
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onHistory}>
                <History className="mr-2 h-4 w-4" /> View history
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {isOwner && (
        <p className="mx-5 mt-4 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <Lock className="h-4 w-4 shrink-0 text-slate-400" />
          Owner always has every page.
        </p>
      )}

      {!isOwner && openCount === 0 && (
        <div className="mx-5 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
          <p className="text-sm text-slate-600">This role can&apos;t open any admin pages.</p>
          <Button variant="outline" size="sm" onClick={onCopy}>
            <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy access from…
          </Button>
        </div>
      )}

      <div className="divide-y divide-slate-100">
        {ADMIN_AREAS.map((area) => {
          const sections = ADMIN_SECTIONS.filter((s) => s.area === area.key);
          return (
            <div key={area.key} className="px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {area.label}
              </p>
              <ul className="mt-1">
                {sections.map((section) => {
                  const on = draft[section.key].includes(role);
                  const pending = on !== savedMap[section.key].includes(role);
                  const reason = isOwner ? null : lockedReason(section, role, draft);
                  const disabled = isOwner || reason !== null;
                  const switchId = `access-${section.key}`;
                  return (
                    <li key={section.key} className="flex items-start justify-between gap-4 py-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <label
                            htmlFor={switchId}
                            className={cn(
                              "text-sm font-medium",
                              disabled ? "text-slate-500" : "cursor-pointer text-slate-900",
                            )}
                          >
                            {section.label}
                          </label>
                          {pending && <PendingDot />}
                          <InPageRules label={section.label} rules={section.inPageRules} />
                        </div>
                        <p className="text-sm text-slate-500">{section.description}</p>
                        {reason && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                            <Lock className="h-3 w-3 shrink-0" />
                            {reason}
                            {section.lock?.kind === "team" && (
                              <Link
                                href={section.lock.href}
                                className="ml-1 text-blue-600 hover:text-blue-700"
                              >
                                {section.lock.linkLabel} →
                              </Link>
                            )}
                          </p>
                        )}
                      </div>
                      <Switch
                        id={switchId}
                        checked={on}
                        disabled={disabled}
                        onCheckedChange={(checked) => onToggle(section.key, checked)}
                        aria-label={`Allow ${ROLE_LABELS[role]} to open ${section.label}`}
                        className="mt-0.5 data-[state=checked]:bg-blue-600"
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
