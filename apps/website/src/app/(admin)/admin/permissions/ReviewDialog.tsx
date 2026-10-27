"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  countAffectedByChange,
  riskWarnings,
  type RoleCombo,
} from "@/lib/admin-access/diff";
import type { AccessChange, AccessMap } from "@/lib/admin-access/resolve";
import { getAdminSection } from "@/lib/admin-access/sections";
import type { PermissionsPageData } from "@/lib/data/admin/permissions";
import { ROLE_LABELS } from "@/lib/role-labels";
import type { Role } from "@/lib/roles";
import { AlertTriangle, Loader2, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { actorName, peopleLabel, timeAgo } from "./shared";

export type SaveOutcome =
  | { kind: "saved" }
  | { kind: "conflict"; latest: PermissionsPageData };

function affectedLabel(
  change: AccessChange,
  affected: number,
  peopleWithRole: number,
) {
  if (affected > 0) {
    return `${change.granted ? "+" : "−"}${peopleLabel(affected)}`;
  }
  if (peopleWithRole === 0) return "No one has this role";
  return change.granted
    ? "No change: they already have it"
    : "No change: another role keeps it";
}

export function ReviewDialog({
  open,
  onOpenChange,
  changes,
  before,
  after,
  combos,
  peopleByRole,
  actorRoles,
  onSave,
  onReapply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  changes: AccessChange[];
  before: AccessMap;
  after: AccessMap;
  combos: RoleCombo[];
  peopleByRole: Map<Role, number>;
  actorRoles: Role[];
  onSave: (note: string) => Promise<SaveOutcome>;
  onReapply: (latest: PermissionsPageData) => void;
}) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState<PermissionsPageData | null>(null);

  const warnings = riskWarnings({ before, after, actorRoles, combos });
  const byRole = new Map<Role, AccessChange[]>();
  for (const change of changes) {
    byRole.set(change.role, [...(byRole.get(change.role) ?? []), change]);
  }

  function close(next: boolean) {
    if (saving) return;
    if (!next) setConflict(null);
    onOpenChange(next);
  }

  async function save() {
    setSaving(true);
    try {
      const outcome = await onSave(note.trim());
      if (outcome.kind === "conflict") {
        setConflict(outcome.latest);
        return;
      }
      setNote("");
      onOpenChange(false);
    } catch {
      // onSave has already shown the error; keep the dialog open to retry.
    } finally {
      setSaving(false);
    }
  }

  function reapply() {
    if (!conflict) return;
    onReapply(conflict);
    setConflict(null);
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Review changes</DialogTitle>
          <DialogDescription>
            {changes.length === 0
              ? "Nothing left to save."
              : "Saved changes apply right away, including for people who are signed in now."}
          </DialogDescription>
        </DialogHeader>

        {conflict && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
            <p>
              {actorName(conflict.updatedBy)} saved page access
              {conflict.updatedAt ? ` ${timeAgo(conflict.updatedAt)}` : ""}, so yours
              wasn&apos;t saved. Your edits are still here.
            </p>
            <Button size="sm" variant="outline" className="mt-2 bg-white" onClick={reapply}>
              Load latest and re-apply mine
            </Button>
          </div>
        )}

        {!conflict && warnings.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <ul className="space-y-1.5">
              {warnings.map((warning) => (
                <li key={warning.message} className="flex gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <span>{warning.message}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="max-h-[45vh] space-y-4 overflow-y-auto pr-1">
          {[...byRole.entries()].map(([role, roleChanges]) => (
            <div key={role}>
              <p className="text-sm font-medium text-slate-900">{ROLE_LABELS[role]}</p>
              <ul className="mt-1 space-y-1">
                {roleChanges.map((change) => {
                  const affected = countAffectedByChange(combos, before, after, change);
                  const Icon = change.granted ? Plus : Minus;
                  return (
                    <li
                      key={`${change.section}-${change.role}`}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="flex items-center gap-2 text-slate-700">
                        <Icon
                          className={
                            change.granted
                              ? "h-3.5 w-3.5 text-emerald-600"
                              : "h-3.5 w-3.5 text-red-600"
                          }
                        />
                        {change.granted ? "Can now open " : "Can no longer open "}
                        {getAdminSection(change.section).label}
                      </span>
                      <span className="shrink-0 text-xs text-slate-400">
                        {affectedLabel(change, affected, peopleByRole.get(role) ?? 0)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <Textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={500}
          rows={2}
          placeholder="Add a note for the history (optional)"
          aria-label="Note for the history"
        />

        <DialogFooter>
          <Button variant="ghost" onClick={() => close(false)} disabled={saving}>
            Keep editing
          </Button>
          <Button
            onClick={save}
            disabled={saving || conflict !== null || changes.length === 0}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save {changes.length === 1 ? "change" : `${changes.length} changes`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
