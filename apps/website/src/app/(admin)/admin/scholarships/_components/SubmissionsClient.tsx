"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminSubmission } from "@/lib/data/admin/scholarships";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function SubmissionsClient({ submissions }: { submissions: AdminSubmission[] }) {
  const router = useRouter();
  const [items, setItems] = useState(submissions);
  const [dismissing, setDismissing] = useState<string | null>(null);
  const [note, setNote] = useState("");

  async function patch(id: string, body: Record<string, unknown>) {
    const res = await fetch(`/api/admin/scholarships/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || "Action failed");
    return data;
  }

  async function createDraft(item: AdminSubmission) {
    try {
      const data = await patch(item.id, { action: "create-draft" });
      router.push(`/admin/scholarships/${data.data.scholarshipId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
  }

  async function dismiss(id: string) {
    try {
      await patch(id, { action: "dismiss", note });
      setItems((list) => list.filter((i) => i.id !== id));
      setDismissing(null);
      setNote("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
  }

  if (items.length === 0) {
    return <p className="py-16 text-center text-sm text-slate-500">No new submissions.</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {item.kind === "correction" ? "Correction" : "New scholarship"}
              </p>
              <p className="mt-0.5 font-medium text-slate-900">
                {item.kind === "correction" && item.scholarship ? (
                  <Link href={`/admin/scholarships/${item.scholarship.id}`} className="hover:text-blue-600">
                    {item.scholarship.title}
                  </Link>
                ) : (
                  item.title
                )}
              </p>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-sm text-blue-600 hover:text-blue-700"
                >
                  {item.url}
                </a>
              )}
              {item.deadline && <p className="text-sm text-slate-600">Deadline: {item.deadline}</p>}
              {item.notes && (
                <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{item.notes}</p>
              )}
              <p className="mt-2 text-xs text-slate-400">
                {item.submittedBy}
                {item.createdAt && ` · ${DATE.format(new Date(item.createdAt))}`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setDismissing(item.id)}>
                Dismiss
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => createDraft(item)}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {item.kind === "correction" ? "Open to fix" : "Create draft"}
              </Button>
            </div>
          </div>

          {dismissing === item.id && (
            <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
              <Input
                autoFocus
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note (optional) — e.g. duplicate, not undergrad"
              />
              <Button type="button" size="sm" variant="outline" onClick={() => dismiss(item.id)}>
                Dismiss
              </Button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
