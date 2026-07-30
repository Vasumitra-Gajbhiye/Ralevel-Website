"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PendingBlogReview } from "@/lib/data/admin/blogsV2";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import BlogStatusBadge from "./BlogStatusBadge";

const REJECT_NOTE_MAX_LENGTH = 3000;

type BlogReviewActionsProps = {
  blog: PendingBlogReview;
};

export default function BlogReviewActions({ blog }: BlogReviewActionsProps) {
  const router = useRouter();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [note, setNote] = useState("");
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const noteOverLimit = note.length > REJECT_NOTE_MAX_LENGTH;
  const canSendFeedback = note.trim().length > 0 && !noteOverLimit;

  async function handleApprove() {
    setApproving(true);
    try {
      const res = await fetch(`/api/admin/blogs/v2/${blog._id}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to approve");
      toast.success("Blog approved and published");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to approve blog",
      );
    } finally {
      setApproving(false);
    }
  }

  async function handleReject() {
    if (!canSendFeedback) {
      toast.error("Please add a note for the writer");
      return;
    }

    setRejecting(true);
    try {
      const res = await fetch(`/api/admin/blogs/v2/${blog._id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to reject");
      toast.success("Sent back to writer with feedback");
      setRejectOpen(false);
      setNote("");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reject blog",
      );
    } finally {
      setRejecting(false);
    }
  }

  return (
    <>
      <div className="border rounded-xl p-4 bg-white space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate">
              {blog.pendingTitle || blog.title}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {blog.ownerName ?? "Writer"} · Submitted {blog.submittedAtLabel}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {blog.reviewType === "update" ? "Update to published post" : "New publication"}
            </div>
          </div>
          <BlogStatusBadge status={blog.status} />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={handleApprove} disabled={approving}>
            {approving ? "Approving…" : "Approve"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setRejectOpen(true)}
            disabled={rejecting}
          >
            Reject
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/blogs/v2/preview/${blog._id}`} target="_blank">
              View
            </Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={`/admin/blogs/v2/${blog._id}/edit`}>Open editor</Link>
          </Button>
          {blog.slug && (
            <Button size="sm" variant="ghost" asChild>
              <Link href={`/blogs/v2/${blog.slug}`} target="_blank">
                View live
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject with feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="review-note">Note for writer</Label>
            <Textarea
              id="review-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Explain what needs to change…"
              rows={5}
              maxLength={REJECT_NOTE_MAX_LENGTH}
            />
            <p
              className={`text-xs text-right ${
                noteOverLimit ? "text-red-600" : "text-gray-500"
              }`}
            >
              {note.length}/{REJECT_NOTE_MAX_LENGTH}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={rejecting || !canSendFeedback}
            >
              {rejecting ? "Sending…" : "Send feedback"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
