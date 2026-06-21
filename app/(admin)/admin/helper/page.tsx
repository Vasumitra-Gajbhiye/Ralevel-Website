"use client";

import { ListPagination } from "@/components/ui/list-pagination";
import type { PaginationMeta } from "@/lib/pagination";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Helper = {
  _id: string;
  username?: string;
  userId?: string;
  email?: string;

  rank: "junior_helper" | "senior_helper";
  activity:
    | "no_concern"
    | "raised_concern"
    | "requires_notice"
    | "not_required";

  promotedAt?: string | null;
};

const RANKS = [
  { value: "junior_helper", label: "Junior Helper" },
  { value: "senior_helper", label: "Senior Helper" },
];

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

function HelperCard({
  helper,
  onDelete,
}: {
  helper: Helper;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(helper);
  const [saving, setSaving] = useState<"idle" | "saving" | "saved">("idle");
  const debounce = useRef<NodeJS.Timeout | null>(null);

  function update(patch: Partial<Helper>) {
    setData((p) => ({ ...p, ...patch }));
    setSaving("saving");

    if (debounce.current) clearTimeout(debounce.current);

    debounce.current = setTimeout(async () => {
      await fetch("/api/admin/helper", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: helper._id, patch }),
      });

      setSaving("saved");

      setTimeout(() => {
        setSaving("idle");
      }, 1200);
    }, 600);
  }

  return (
    <div
      onClick={() => setOpen((o) => !o)}
      className="bg-white border rounded-xl p-4 cursor-pointer hover:shadow-sm transition"
    >
      <div className="flex justify-end mb-1">
        {saving === "saving" && (
          <span className="text-xs text-gray-400">Saving…</span>
        )}
        {saving === "saved" && (
          <span className="text-xs text-emerald-600">All changes saved</span>
        )}
      </div>
      {/* COLLAPSED */}
      <div className="grid grid-cols-[1.4fr_1.2fr_1.6fr_0.6fr] gap-4 items-center">
        <input
          className="border rounded px-3 py-2 font-medium"
          placeholder="Username"
          value={data.username || ""}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => update({ username: e.target.value })}
        />

        <select
          value={data.rank}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            const rank = e.target.value as Helper["rank"];
            update({
              rank,
              promotedAt:
                rank === "senior_helper" ? new Date().toISOString() : null,
            });
          }}
          className="border rounded px-3 py-2"
        >
          {RANKS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        <select
          value={data.activity}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) =>
            update({ activity: e.target.value as Helper["activity"] })
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

      {/* EXPANDED */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              placeholder="Email"
              className="border rounded px-3 py-2"
              value={data.email || ""}
              onChange={(e) => update({ email: e.target.value })}
            />

            <input
              placeholder="User ID"
              className="border rounded px-3 py-2"
              value={data.userId || ""}
              onChange={(e) => update({ userId: e.target.value })}
            />

            {data.rank === "senior_helper" && (
              <input
                type="date"
                className="border rounded px-3 py-2"
                value={data.promotedAt ? data.promotedAt.slice(0, 10) : ""}
                onChange={(e) =>
                  update({
                    promotedAt: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null,
                  })
                }
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HelperPage() {
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  async function load(currentPage = page) {
    const res = await fetch(`/api/admin/helper?page=${currentPage}&limit=50`);
    const result = await res.json();
    setHelpers(result.data ?? []);
    setPagination(result.pagination ?? pagination);
  }

  async function addHelper() {
    const res = await fetch("/api/admin/helper", { method: "POST" });
    const created = await res.json();
    setHelpers((p) => [created, ...p]);
  }

  async function deleteHelper(id: string) {
    await fetch("/api/admin/helper", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  useEffect(() => {
    load(page);
  }, [page]);

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Helper Department</h1>
          <p className="text-sm text-muted-foreground">
            Internal helper moderation records
          </p>
        </div>

        <button
          onClick={addHelper}
          className="flex items-center gap-2 px-4 py-2 rounded bg-black text-white"
        >
          <Plus size={16} /> Add helper
        </button>
      </div>

      <div className="grid grid-cols-[1.4fr_1.2fr_1.5fr_0.6fr] px-4 text-xs font-semibold text-muted-foreground">
        <div>Username</div>
        <div>Rank</div>
        <div>Activity</div>
        <div />
      </div>

      <div className="space-y-3">
        {helpers.map((h) => (
          <HelperCard
            key={h._id}
            helper={h}
            onDelete={() => deleteHelper(h._id)}
          />
        ))}
      </div>

      <ListPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
