"use client";

import type { AdminScheduleItem } from "@/lib/data/admin/scheduling";
import type { PaginationMeta } from "@/lib/pagination";
import { ListPagination } from "@/components/ui/list-pagination";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/* ================= OPTIONS ================= */

const YES_NO = [
  {
    value: "yes",
    label: "Ping Required",
    color: "bg-emerald-50 text-emerald-700",
  },
  { value: "no", label: "No Ping Required", color: "bg-red-50 text-red-700" },
];

const DEVELOPMENT = [
  { value: "awaiting", label: "Awaiting", color: "bg-zinc-50 text-zinc-700" },
  {
    value: "in_development",
    label: "In development",
    color: "bg-blue-50 text-blue-700",
  },
  {
    value: "developed",
    label: "Developed",
    color: "bg-emerald-50 text-emerald-700",
  },
];

const SENT = [
  {
    value: "awaiting",
    label: "Awaiting",
    color: "bg-orange-50 text-orange-700",
  },
  { value: "sent", label: "Sent", color: "bg-emerald-50 text-emerald-700" },
];

const SERVER_EVENT = [
  {
    value: "required",
    label: "Required",
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    value: "not_required",
    label: "Not Required",
    color: "bg-red-50 text-red-700",
  },
];

const STATUS = [
  { value: "dormant", label: "Dormant", color: "bg-zinc-50 text-zinc-700" },
  {
    value: "approaching",
    label: "Approaching",
    color: "bg-blue-50 text-blue-700",
  },
  { value: "ongoing", label: "Ongoing", color: "bg-orange-50 text-orange-700" },
  {
    value: "concluded",
    label: "Concluded",
    color: "bg-emerald-50 text-emerald-700",
  },
];

/* ================= CARD ================= */

function ScheduleCard({
  item,
  onDelete,
}: {
  item: AdminScheduleItem;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(item);
  const [saving, setSaving] = useState(false);
  const debounce = useRef<NodeJS.Timeout | null>(null);

  function update(patch: Partial<AdminScheduleItem>) {
    setData((p) => ({ ...p, ...patch }));
    setSaving(true);

    if (debounce.current) clearTimeout(debounce.current);

    debounce.current = setTimeout(async () => {
      await fetch("/api/admin/scheduling", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item._id, patch }),
      });
      setSaving(false);
    }, 700);
  }

  return (
    <div className="bg-white border rounded-xl p-4">
      <div
        className="grid grid-cols-[2.2fr_1fr_1.4fr_1.4fr_0.5fr_0.4fr] gap-4 items-center cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        <input
          className="border rounded px-3 py-2 font-medium"
          placeholder="Event"
          value={data.event}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => update({ event: e.target.value })}
        />

        <input
          type="date"
          className="border rounded px-3 py-2"
          value={data.date?.slice(0, 10) || ""}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) =>
            update({
              date: e.target.value
                ? new Date(e.target.value).toISOString()
                : null,
            })
          }
        />

        <select
          value={data.serverEvent}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) =>
            update({
              serverEvent: e.target.value as AdminScheduleItem["serverEvent"],
            })
          }
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            SERVER_EVENT.find((s) => s.value === data.serverEvent)?.color
          }`}
        >
          {SERVER_EVENT.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          value={data.status}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) =>
            update({ status: e.target.value as AdminScheduleItem["status"] })
          }
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            STATUS.find((s) => s.value === data.status)?.color
          }`}
        >
          {STATUS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
          className="flex items-center justify-center text-muted-foreground hover:text-foreground transition"
        >
          <ChevronDown
            size={18}
            className={`transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

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
            className="mt-5 pt-5 border-t space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top row */}
            <div className="grid grid-cols-3 gap-4">
              {/* Ping */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Ping
                </label>
                <select
                  value={data.ping}
                  onChange={(e) =>
                    update({
                      ping: e.target.value as AdminScheduleItem["ping"],
                    })
                  }
                  className={`mt-1 w-full rounded-full px-3 py-2 text-sm font-medium ${
                    YES_NO.find((p) => p.value === data.ping)?.color
                  }`}
                >
                  {YES_NO.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Announcement Dev */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Announcement Development
                </label>
                <select
                  value={data.development}
                  onChange={(e) =>
                    update({
                      development: e.target
                        .value as AdminScheduleItem["development"],
                    })
                  }
                  className={`mt-1 w-full rounded px-3  py-2 text-sm font-medium ${
                    DEVELOPMENT.find((s) => s.value === data.development)?.color
                  }`}
                >
                  {DEVELOPMENT.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Announcement Send */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Announcement Send
                </label>
                <select
                  value={data.sent}
                  onChange={(e) =>
                    update({
                      sent: e.target.value as AdminScheduleItem["sent"],
                    })
                  }
                  className={`mt-1 w-full rounded px-3  py-2 text-sm font-medium ${
                    SENT.find((s) => s.value === data.sent)?.color
                  }`}
                >
                  {SENT.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Details */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Details
              </label>
              <textarea
                className="mt-1 w-full min-h-[140px] border rounded px-3 py-2 text-sm"
                placeholder="Notes, links, context, reminders…"
                value={data.details || ""}
                onChange={(e) => update({ details: e.target.value })}
              />
            </div>

            <div className="text-xs text-right text-muted-foreground">
              {saving ? "Saving…" : "All changes saved"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= PAGE ================= */

export default function AdminSchedulingClient({
  initialItems,
  pagination,
}: {
  initialItems: AdminScheduleItem[];
  pagination: PaginationMeta;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  async function addItem() {
    await fetch("/api/admin/scheduling", { method: "POST" });
    router.refresh();
  }

  async function deleteItem(id: string) {
    await fetch("/api/admin/scheduling", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  return (
    <div className="max-w-[1600px] mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Schedule</h1>
          <p className="text-sm text-muted-foreground">
            Event planning & announcement tracking
          </p>
        </div>

        <button
          onClick={addItem}
          className="flex items-center gap-2 px-4 py-2 rounded bg-black text-white"
        >
          <Plus size={16} /> Add event
        </button>
      </div>

      {/* HEADER */}
      <div className="grid grid-cols-[2.2fr_1fr_1.4fr_1.4fr_0.5fr] px-4 text-xs font-semibold text-muted-foreground">
        <div>Event</div>
        <div>Date</div>
        <div>Server Event</div>
        <div>Status</div>
        <div />
      </div>

      <div className="space-y-3">
        {items.map((i) => (
          <ScheduleCard
            key={i._id}
            item={i}
            onDelete={() => deleteItem(i._id)}
          />
        ))}
      </div>

      <ListPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(nextPage) =>
          router.push(`/admin/scheduling?page=${nextPage}`)
        }
      />
    </div>
  );
}
