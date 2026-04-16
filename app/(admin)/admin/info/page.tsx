"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* ================= TYPES ================= */

type InfoMember = {
  _id: string;
  username?: string;
  userId?: string;
  email?: string;
  positionStart?: string;
  activity:
    | "no_concern"
    | "raised_concern"
    | "requires_notice"
    | "not_required";
};

/* ================= CONSTANTS ================= */

const ACTIVITIES = [
  {
    value: "no_concern",
    label: "No concern",
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    value: "raised_concern",
    label: "Raised concern",
    color: "bg-yellow-50 text-yellow-800",
  },
  {
    value: "requires_notice",
    label: "Requires notice",
    color: "bg-red-50 text-red-700",
  },
  {
    value: "not_required",
    label: "Not required",
    color: "bg-slate-50 text-slate-600",
  },
];

/* ================= CARD ================= */

function InfoCard({
  member,
  onDelete,
}: {
  member: InfoMember;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(member);
  const [saving, setSaving] = useState<"idle" | "saving" | "saved">("idle");
  const debounce = useRef<NodeJS.Timeout | null>(null);

  function update(patch: Partial<InfoMember>) {
    setData((p) => ({ ...p, ...patch }));
    setSaving("saving");

    if (debounce.current) clearTimeout(debounce.current);

    debounce.current = setTimeout(async () => {
      await fetch("/api/admin/info", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: member._id, patch }),
      });

      setSaving("saved");
      setTimeout(() => setSaving("idle"), 1200);
    }, 600);
  }

  return (
    <div
      onClick={() => setOpen((o) => !o)}
      className="bg-white border rounded-xl p-4 cursor-pointer transition hover:shadow-sm"
    >
      {/* SAVE STATE */}
      <div className="flex justify-end text-xs mb-1">
        {saving === "saving" && <span className="text-gray-400">Saving…</span>}
        {saving === "saved" && (
          <span className="text-emerald-600">All changes saved</span>
        )}
      </div>

      {/* COLLAPSED */}
      <div className="grid grid-cols-[1.4fr_1.4fr_1.8fr_1.2fr_0.6fr] gap-4 items-center">
        <input
          className="border rounded px-3 py-2 font-medium"
          placeholder="Username"
          value={data.username || ""}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => update({ username: e.target.value })}
        />

        <input
          className="border rounded px-3 py-2"
          placeholder="User ID"
          value={data.userId || ""}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => update({ userId: e.target.value })}
        />

        <input
          className="border rounded px-3 py-2"
          placeholder="Email"
          value={data.email || ""}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => update({ email: e.target.value })}
        />

        <input
          type="date"
          className="border rounded px-3 py-2"
          value={data.positionStart?.slice(0, 10) || ""}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) =>
            update({
              positionStart: e.target.value
                ? new Date(e.target.value).toISOString()
                : undefined,
            })
          }
        />

        <select
          value={data.activity}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) =>
            update({ activity: e.target.value as InfoMember["activity"] })
          }
          className={`border rounded px-3 py-2 ${
            ACTIVITIES.find((a) => a.value === data.activity)?.color
          }`}
        >
          {ACTIVITIES.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

      {/* DELETE */}
      <div className="flex justify-end mt-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

/* ================= PAGE ================= */

export default function InfoPage() {
  const [members, setMembers] = useState<InfoMember[]>([]);

  async function load() {
    const res = await fetch("/api/admin/info");
    setMembers(await res.json());
  }

  async function addMember() {
    const res = await fetch("/api/admin/info", { method: "POST" });
    const created = await res.json();
    setMembers((p) => [created, ...p]);
  }

  async function deleteMember(id: string) {
    await fetch("/api/admin/info", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community Department</h1>
          <p className="text-sm text-muted-foreground">
            Internal informative team records
          </p>
        </div>

        <button
          onClick={addMember}
          className="flex items-center gap-2 px-4 py-2 rounded bg-black text-white"
        >
          <Plus size={16} /> Add member
        </button>
      </div>

      {/* HEADER */}
      <div className="grid grid-cols-[1.4fr_1.4fr_1.8fr_1.2fr_0.6fr] px-4 text-xs font-semibold text-muted-foreground">
        <div>Username</div>
        <div>User ID</div>
        <div>Email</div>
        <div>Position start</div>
        <div>Activity</div>
      </div>

      <div className="space-y-3">
        {members.map((m) => (
          <InfoCard
            key={m._id}
            member={m}
            onDelete={() => deleteMember(m._id)}
          />
        ))}
      </div>
    </div>
  );
}
