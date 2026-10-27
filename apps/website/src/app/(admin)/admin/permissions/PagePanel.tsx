"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isCustomized, type AccessMap } from "@/lib/admin-access/resolve";
import {
  getAdminSection,
  type AdminSectionKey,
} from "@/lib/admin-access/sections";
import type { ChangeStamp } from "@/lib/data/admin/permissions";
import { ROLE_LABELS, ROLE_UI_GROUPS } from "@/lib/role-labels";
import type { Role } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { ArrowUpRight, History, Lock, MoreHorizontal, RotateCcw } from "lucide-react";
import Link from "next/link";
import { PendingDot, actorName, peopleLabel, timeAgo } from "./shared";

export function PagePanel({
  sectionKey,
  draft,
  savedMap,
  peopleByRole,
  lastChange,
  onToggle,
  onReset,
  onHistory,
}: {
  sectionKey: AdminSectionKey;
  draft: AccessMap;
  savedMap: AccessMap;
  peopleByRole: Map<Role, number>;
  lastChange?: ChangeStamp;
  onToggle: (role: Role, granted: boolean) => void;
  onReset: () => void;
  onHistory: () => void;
}) {
  const section = getAdminSection(sectionKey);
  const parent = section.requires ? getAdminSection(section.requires) : null;
  const customized = isCustomized(draft, { section: sectionKey });
  const href = section.nav[0]?.href ?? section.prefixes[0];

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900">{section.label}</h2>
            {customized && <Badge variant="secondary">Customized</Badge>}
          </div>
          <p className="mt-1 text-sm text-slate-500">{section.description}</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <Link
              href={href}
              className="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-700"
            >
              Open page <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            {lastChange && (
              <span className="text-slate-400">
                Changed {timeAgo(lastChange.at)} by {actorName(lastChange.by)}
              </span>
            )}
          </p>
        </div>
        {!section.lock && (
          // Non-modal so the dialog or sheet it opens gets focus cleanly.
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`More actions for ${section.label}`}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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

      {(section.lock || section.inPageRules?.length || parent) && (
        <div className="mx-5 mt-4 space-y-2 rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
          {section.lock && (
            <p className="flex items-start gap-2">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <span>
                {section.lock.note}
                {section.lock.kind === "team" && (
                  <Link href={section.lock.href} className="ml-1 text-blue-600 hover:text-blue-700">
                    {section.lock.linkLabel} →
                  </Link>
                )}
              </span>
            </p>
          )}
          {parent && <p>Only roles that can open {parent.label} can open this page.</p>}
          {section.inPageRules?.length ? (
            <div>
              <p className="font-medium text-slate-700">Rules inside this page</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {section.inPageRules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}

      <div className="divide-y divide-slate-100">
        {ROLE_UI_GROUPS.map((group) => (
          <fieldset key={group.label} className="px-5 py-4">
            <legend className="sr-only">{group.label}</legend>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400" aria-hidden>
              {group.label}
            </p>
            <ul className="mt-2 grid gap-x-6 sm:grid-cols-2">
              {group.roles.map((role) => {
                const on = draft[sectionKey].includes(role);
                const pending = on !== savedMap[sectionKey].includes(role);
                const needsParent = parent !== null && !draft[parent.key].includes(role);
                const disabled = role === "owner" || !!section.lock || needsParent;
                const people = peopleByRole.get(role) ?? 0;
                const id = `page-${sectionKey}-${role}`;
                return (
                  <li key={role} className="flex items-center gap-3 py-2">
                    <Checkbox
                      id={id}
                      checked={on}
                      disabled={disabled}
                      onCheckedChange={(checked) => onToggle(role, checked === true)}
                      className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                    />
                    <label
                      htmlFor={id}
                      className={cn(
                        "flex min-w-0 flex-1 items-center gap-1.5 text-sm",
                        disabled ? "text-slate-400" : "cursor-pointer text-slate-800",
                      )}
                      title={needsParent && parent ? `Needs ${parent.label} first` : undefined}
                    >
                      <span className="truncate">{ROLE_LABELS[role]}</span>
                      {pending && <PendingDot />}
                    </label>
                    <span className="shrink-0 text-xs text-slate-400">
                      {role === "owner" ? "Always" : peopleLabel(people)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        ))}
      </div>
    </div>
  );
}
