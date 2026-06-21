"use client";

import { ListPagination } from "@/components/ui/list-pagination";
import type { AdminGraphicMember } from "@/lib/data/admin/graphic";
import type { PaginationMeta } from "@/lib/pagination";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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

function GraphicCard({
  member,
  onDelete,
}: {
  member: AdminGraphicMember;
  onDelete: () => void;
}) {
  const [data, setData] = useState(member);
  const [saving, setSaving] = useState<"idle" | "saving" | "saved">("idle");
  const debounce = useRef<NodeJS.Timeout | null>(null);

  function update(patch: Partial<AdminGraphicMember>) {
    setData((p) => ({ ...p, ...patch }));
    setSaving("saving");

    if (debounce.current) clearTimeout(debounce.current);

    debounce.current = setTimeout(async () => {
      await fetch("/api/admin/graphic", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: member._id, patch }),
      });

      setSaving("saved");
      setTimeout(() => setSaving("idle"), 1200);
    }, 600);
  }

  return (
    <div className="bg-white border rounded-xl p-4 space-y-2">
      {/* SAVE STATE */}
      <div className="flex justify-end text-xs">
        {saving === "saving" && <span className="text-gray-400">Saving…</span>}
        {saving === "saved" && (
          <span className="text-emerald-600">All changes saved</span>
        )}
      </div>

      <div className="grid grid-cols-[1.4fr_1.4fr_2fr_1.2fr_1.4fr_0.8fr] gap-3 items-center">
        <input
          className="border rounded px-3 py-2"
          placeholder="User ID"
          value={data.userId || ""}
          onChange={(e) => update({ userId: e.target.value })}
        />

        <input
          className="border rounded px-3 py-2 font-medium"
          placeholder="Username"
          value={data.username || ""}
          onChange={(e) => update({ username: e.target.value })}
        />

        <input
          className="border rounded px-3 py-2"
          placeholder="Email"
          value={data.email || ""}
          onChange={(e) => update({ email: e.target.value })}
        />

        <input
          type="date"
          className="border rounded px-3 py-2"
          value={data.positionStart?.slice(0, 10) || ""}
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
          onChange={(e) =>
            update({ activity: e.target.value as AdminGraphicMember["activity"] })
          }
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            ACTIVITIES.find((a) => a.value === data.activity)?.color
          }`}
        >
          {ACTIVITIES.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>

        <input
          type="number"
          min={0}
          className="border rounded px-3 py-2 text-sm"
          value={data.resourceSubmissions}
          onChange={(e) =>
            update({ resourceSubmissions: Number(e.target.value) || 0 })
          }
        />
      </div>

      <div className="flex justify-end">
        <button onClick={onDelete} className="text-red-500 hover:text-red-700">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

/* ================= PAGE ================= */

export default function AdminGraphicClient({
  initialMembers,
  pagination,
}: {
  initialMembers: AdminGraphicMember[];
  pagination: PaginationMeta;
}) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers);

  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  async function addMember() {
    await fetch("/api/admin/graphic", { method: "POST" });
    router.refresh();
  }

  async function deleteMember(id: string) {
    await fetch("/api/admin/graphic", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Graphic Design Department</h1>
          <p className="text-sm text-muted-foreground">
            Internal graphic design team records
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
      <div className="grid grid-cols-[1.4fr_1.4fr_2fr_1.2fr_1.4fr_0.8fr] px-4 text-xs font-semibold text-muted-foreground">
        <div>User ID</div>
        <div>Username</div>
        <div>Email</div>
        <div>Position start</div>
        <div>Activity</div>
        <div>Resources</div>
      </div>

      <div className="space-y-3">
        {members.map((m) => (
          <GraphicCard
            key={m._id}
            member={m}
            onDelete={() => deleteMember(m._id)}
          />
        ))}
      </div>

      <ListPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(nextPage) =>
          router.push(`/admin/graphic?page=${nextPage}`)
        }
      />
    </div>
  );
}
