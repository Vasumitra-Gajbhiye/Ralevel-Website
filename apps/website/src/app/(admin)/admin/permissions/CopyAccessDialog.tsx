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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AccessMap } from "@/lib/admin-access/resolve";
import { ADMIN_SECTIONS } from "@/lib/admin-access/sections";
import { ROLE_LABELS, ROLE_UI_GROUPS } from "@/lib/role-labels";
import type { Role } from "@/lib/roles";
import { useState } from "react";

export function CopyAccessDialog({
  target,
  draft,
  open,
  onOpenChange,
  onCopy,
}: {
  target: Role;
  draft: AccessMap;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCopy: (from: Role) => void;
}) {
  const [from, setFrom] = useState<Role | "">("");
  const pages = from
    ? ADMIN_SECTIONS.filter((s) => !s.lock && draft[s.key].includes(from)).map((s) => s.label)
    : [];

  function close(next: boolean) {
    if (!next) setFrom("");
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Copy access to {ROLE_LABELS[target]}</DialogTitle>
          <DialogDescription>
            {ROLE_LABELS[target]} gets exactly the pages of the role you pick. Locked
            pages aren&apos;t affected, and you can review everything before saving.
          </DialogDescription>
        </DialogHeader>

        <Select value={from} onValueChange={(value) => setFrom(value as Role)}>
          <SelectTrigger aria-label="Copy from role">
            <SelectValue placeholder="Choose a role" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_UI_GROUPS.map((group) => {
              const roles = group.roles.filter((role) => role !== target && role !== "owner");
              if (roles.length === 0) return null;
              return (
                <SelectGroup key={group.label}>
                  <SelectLabel>{group.label}</SelectLabel>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              );
            })}
          </SelectContent>
        </Select>

        {from && (
          <p className="text-sm text-slate-600">
            {pages.length === 0
              ? `${ROLE_LABELS[from]} can't open any editable pages, so this removes all of them.`
              : `${ROLE_LABELS[from]} can open ${pages.join(", ")}.`}
          </p>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => close(false)}>
            Cancel
          </Button>
          <Button
            disabled={!from}
            onClick={() => {
              if (!from) return;
              onCopy(from);
              close(false);
            }}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Copy access
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
