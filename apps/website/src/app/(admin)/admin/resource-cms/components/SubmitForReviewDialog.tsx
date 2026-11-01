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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ResourceCmsGroupedChange } from "@/types/resources2";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ChangeList from "./ChangeList";

const TITLE_MAX = 120;

export default function SubmitForReviewDialog({
  open,
  onOpenChange,
  slug,
  subject,
  changes,
  suggestedTitle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
  subject: string;
  changes: ResourceCmsGroupedChange[];
  suggestedTitle: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(suggestedTitle.slice(0, TITLE_MAX));
      setDescription("");
    }
  }, [open, suggestedTitle]);

  async function submit() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/resource-cms/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, title: title.trim(), description: description.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't submit for review");
      toast.success(`Sent for review as request #${data.number}`);
      onOpenChange(false);
      router.push(`/admin/resource-cms/requests/${data.number}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't submit for review");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submit {subject} for review</DialogTitle>
          <DialogDescription>
            A head or admin will review these changes before they go live. The
            subject is locked for editing while it&apos;s in review.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="cr-title" className="text-sm font-medium text-slate-700">
              Title
            </label>
            <Input
              id="cr-title"
              value={title}
              maxLength={TITLE_MAX}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="cr-description" className="text-sm font-medium text-slate-700">
              Notes for the reviewer <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <Textarea
              id="cr-description"
              value={description}
              maxLength={2000}
              rows={3}
              placeholder="Why these changes, anything to double-check…"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">
              {changes.length} change{changes.length === 1 ? "" : "s"}
            </p>
            <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-200 p-3">
              <ChangeList changes={changes} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy || !title.trim()}>
            {busy ? "Submitting…" : "Submit for review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
