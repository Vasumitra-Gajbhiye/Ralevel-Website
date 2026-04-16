"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";

/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */

type Staff = {
  _id: string;
  username?: string;
  email?: string;
  realName?: string;
  userId?: string;

  rank: Rank;
  activity: Activity;
  behaviour: Behaviour;
  state: State;

  positionStart?: string;
  lastPromotion?: string;
  notes?: string;
};

export type Rank =
  | "community_lead"
  | "admin"
  | "senior_mod"
  | "junior_mod"
  | "trial_mod"
  | "former_staff"
  | "mod_dep_head"
  | "helper_dep_head"
  | "graphic_dep_head"
  | "info_dep_head";

export type Activity =
  | "no_concern"
  | "minor_concern"
  | "raised_concern"
  | "critical_concern"
  | "requires_notice"
  | "not_required";

export type Behaviour =
  | "no_record"
  | "minor_record"
  | "raised_record"
  | "degraded_record"
  | "disregarded";

export type State = "active" | "loa" | "discharged";

/* ------------------------------------------------------------------ */
/* CONSTANTS */
/* ------------------------------------------------------------------ */

const RANKS: { value: Rank; label: string }[] = [
  { value: "community_lead", label: "Community Lead" },
  { value: "admin", label: "Admin" },
  { value: "mod_dep_head", label: "MOD Dep. Head" },
  { value: "helper_dep_head", label: "HLP Dep. Head" },
  { value: "graphic_dep_head", label: "GFX Dep. Head" },
  { value: "info_dep_head", label: "INFO Dep. Head" },
  { value: "senior_mod", label: "Senior Moderator" },
  { value: "junior_mod", label: "Junior Moderator" },
  { value: "trial_mod", label: "Trial Moderator" },
  { value: "former_staff", label: "Former Staff" },
];

const ACTIVITIES: { value: Activity; label: string }[] = [
  { value: "no_concern", label: "No concern" },
  { value: "minor_concern", label: "Minor concern" },
  { value: "raised_concern", label: "Raised concern" },
  { value: "critical_concern", label: "Critical concern" },
  { value: "requires_notice", label: "Requires notice" },
  { value: "not_required", label: "Not required" },
];

export const BEHAVIOURS = [
  { value: "no_record", label: "No record" },
  { value: "minor_record", label: "Minor record" },
  { value: "raised_record", label: "Raised record" },
  { value: "degraded_record", label: "Degraded record" },
  { value: "disregarded", label: "Disregarded" },
] as const;

export const STATES = [
  { value: "active", label: "Active" },
  { value: "loa", label: "LOA" },
  { value: "discharged", label: "N/A" },
] as const;

const ACTIVITY_COLORS: Record<Activity, string> = {
  no_concern: "bg-emerald-50 text-emerald-700",
  minor_concern: "bg-yellow-50 text-yellow-700",
  raised_concern: "bg-orange-50 text-orange-700",
  critical_concern: "bg-red-50 text-red-700",
  requires_notice: "bg-purple-50 text-purple-700",
  not_required: "bg-slate-50 text-slate-600",
};

export const BEHAVIOUR_COLORS: Record<Behaviour, string> = {
  no_record: "bg-slate-100 text-slate-700",
  minor_record: "bg-yellow-100 text-yellow-800",
  raised_record: "bg-orange-100 text-orange-800",
  degraded_record: "bg-red-100 text-red-800",
  disregarded: "bg-zinc-200 text-zinc-800",
};

export const STATE_COLORS: Record<State, string> = {
  active: "bg-emerald-100 text-emerald-800",
  loa: "bg-blue-100 text-blue-800",
  discharged: "bg-gray-100 text-gray-800",
};

function dateToInputValue(date?: string) {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function inputValueToISO(value: string) {
  if (!value) return undefined;
  return new Date(value).toISOString();
}

/* ------------------------------------------------------------------ */
/* STAFF CARD */
/* ------------------------------------------------------------------ */

function StaffCard({ member }: { member: Staff }) {
  const [open, setOpen] = useState(false);

  const [data, setData] = useState<Staff>(member);
  const [saving, setSaving] = useState(false);
  const debounce = useRef<NodeJS.Timeout | null>(null);

  function update(patch: Partial<Staff>) {
    setData((p) => ({ ...p, ...patch }));

    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setSaving(true);
      await fetch(`/api/admin/team/${member._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      setSaving(false);
    }, 600);
  }

  async function deleteMember() {
    await fetch(`/api/admin/team/${member._id}`, {
      method: "DELETE",
    });
  }

  const isOwner = data.rank === "community_lead";

  return (
    <Card
      onClick={() => setOpen((o) => !o)}
      className={`p-4 rounded-xl cursor-pointer transition border
      `}
    >
      {/* COLLAPSED */}
      <div className="grid grid-cols-[1.5fr_1.3fr_1.3fr_1.3fr_0.7fr_auto] gap-4 items-center">
        <div onClick={(e) => e.stopPropagation()}>
          <Input
            className="font-semibold"
            placeholder="Username"
            value={data.username || ""}
            onChange={(e) => update({ username: e.target.value })}
          />
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <Select
            value={data.rank}
            onValueChange={(v) => update({ rank: v as Rank })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {RANKS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <Select
            value={data.activity}
            onValueChange={(v) => update({ activity: v as Activity })}
          >
            <SelectTrigger className={ACTIVITY_COLORS[data.activity]}>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {ACTIVITIES.map((a) => (
                <SelectItem key={a.value} value={a.value}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <Select
            value={data.behaviour}
            onValueChange={(v) => update({ behaviour: v as Behaviour })}
          >
            <SelectTrigger className={BEHAVIOUR_COLORS[data.behaviour]}>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {BEHAVIOURS.map((b) => (
                <SelectItem key={b.value} value={b.value}>
                  {b.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <Select
            value={data.state}
            onValueChange={(v) => update({ state: v as State })}
          >
            <SelectTrigger className={STATE_COLORS[data.state]}>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {STATES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className={`p-2 rounded-md transition ${
                isOwner
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-red-500 hover:bg-red-50"
              }`}
              title={
                isOwner ? "Owner cannot be deleted" : "Remove staff member"
              }
              disabled={isOwner}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </AlertDialogTrigger>

          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            {isOwner ? (
              <>
                <AlertDialogHeader>
                  <AlertDialogTitle>Action not allowed</AlertDialogTitle>
                  <AlertDialogDescription>
                    The <strong>owner</strong> account cannot be removed.
                    <br />
                    Ownership must be transferred manually before deletion.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Got it</AlertDialogCancel>
                </AlertDialogFooter>
              </>
            ) : (
              <>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove staff member?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove{" "}
                    <span className="font-medium">
                      {data.username || "this member"}
                    </span>{" "}
                    from the staff records. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={async () => {
                      const res = await fetch(`/api/admin/team/${member._id}`, {
                        method: "DELETE",
                      });

                      if (res.ok) {
                        location.reload();
                      }
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </>
            )}
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* EXPANDED */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <Input
              placeholder="Email"
              value={data.email || ""}
              onChange={(e) => update({ email: e.target.value })}
            />
            <Input
              placeholder="User ID"
              value={data.userId || ""}
              onChange={(e) => update({ userId: e.target.value })}
            />
            <Input
              placeholder="Real name"
              value={data.realName || ""}
              onChange={(e) => update({ realName: e.target.value })}
            />
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Position start
              </label>
              <Input
                type="date"
                value={dateToInputValue(data.positionStart)}
                onChange={(e) =>
                  update({
                    positionStart: inputValueToISO(e.target.value),
                  })
                }
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Last promotion
              </label>
              <Input
                type="date"
                value={dateToInputValue(data.lastPromotion)}
                onChange={(e) =>
                  update({
                    lastPromotion: inputValueToISO(e.target.value),
                  })
                }
              />
            </div>
            <Input
              placeholder="Notes"
              value={data.notes || ""}
              onChange={(e) => update({ notes: e.target.value })}
            />

            <div className="col-span-2 text-xs text-right text-muted-foreground">
              {saving ? "Saving…" : "All changes saved"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* PAGE */
/* ------------------------------------------------------------------ */

export default function TeamPage() {
  const [staff, setStaff] = useState<Staff[]>([]);

  async function load() {
    const res = await fetch("/api/admin/team");
    const data = await res.json();
    setStaff(data);
  }

  async function addStaff() {
    const res = await fetch("/api/admin/team", { method: "POST" });
    const created = await res.json();
    setStaff((p) => [created, ...p]);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Department</h1>
          <p className="text-sm text-muted-foreground">
            Internal moderation & administration records
          </p>
        </div>

        <Button onClick={addStaff} className="gap-2">
          <Plus className="w-4 h-4" />
          Add staff
        </Button>
      </div>

      <div className="grid grid-cols-[1.5fr_1.3fr_1.3fr_1.3fr_0.7fr] px-4 text-xs font-semibold text-muted-foreground">
        <div>Username</div>
        <div>Rank</div>
        <div>Activity</div>
        <div>Behaviour</div>
        <div>State</div>
      </div>

      <div className="space-y-3">
        {staff.map((m) => (
          <StaffCard key={m._id} member={m} />
        ))}
      </div>
    </div>
  );
}
