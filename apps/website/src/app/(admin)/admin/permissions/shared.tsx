"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { RoleCombo } from "@/lib/admin-access/diff";
import type { ChangeActor } from "@/lib/data/admin/permissions";
import type { Role } from "@/lib/roles";
import { formatDistanceToNow } from "date-fns";
import { Info } from "lucide-react";

export function PendingDot({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 ${className}`}
      aria-label="Unsaved change"
      title="Unsaved change"
    />
  );
}

export function InPageRules({
  label,
  rules,
}: {
  label: string;
  rules?: readonly string[];
}) {
  if (!rules?.length) return null;
  return (
    <Popover>
      <PopoverTrigger
        className="rounded text-slate-400 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        aria-label={`Rules inside ${label}`}
      >
        <Info className="h-3.5 w-3.5" />
      </PopoverTrigger>
      <PopoverContent className="w-72 text-sm" align="start">
        <p className="font-medium text-slate-900">Rules inside {label}</p>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-slate-600">
          {rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

export function timeAgo(iso: string) {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

export function actorName(actor: ChangeActor | null | undefined) {
  return actor?.name || actor?.email || "Someone";
}

export function peopleLabel(count: number) {
  return count === 1 ? "1 person" : `${count} people`;
}

export function countPeopleByRole(combos: readonly RoleCombo[]) {
  const counts = new Map<Role, number>();
  for (const combo of combos) {
    for (const role of combo.roles) {
      counts.set(role, (counts.get(role) ?? 0) + combo.count);
    }
  }
  return counts;
}
