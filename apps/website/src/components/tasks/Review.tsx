"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { tasksApi } from "@/lib/tasks/client";
import { starLabel } from "@/lib/tasks/stars";
import type { TaskDTO } from "@/lib/tasks/types";
import { cn } from "@/lib/utils";
import { ExternalLink, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AutoTextarea } from "./DetailSections";
import { UserAvatar } from "./bits";
import { useTasksUI } from "./TasksContext";

type ReviewTask = Pick<TaskDTO, "id" | "title" | "stars" | "claimable" | "assignee" | "submission" | "completedAt" | "perms">;

/** Muted "★2" for tasks with a reward. */
export function StarsChip({ stars, className }: { stars: number; className?: string }) {
  if (!stars) return null;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-amber-600", className)} title={`Reward: ${starLabel(stars)}`}>
      <Star className="h-3 w-3 fill-current" />
      {stars}
    </span>
  );
}

type ReviewState = "open" | "in_review" | "changes";

export function reviewStateOf(task: Pick<ReviewTask, "completedAt" | "submission" | "claimable" | "assignee">): ReviewState | null {
  if (task.completedAt) return null;
  if (task.submission?.state === "submitted") return "in_review";
  if (task.submission?.state === "changes_requested") return "changes";
  return task.claimable && !task.assignee ? "open" : null;
}

const STATE_CHIP: Record<ReviewState, { label: string; className: string }> = {
  open: { label: "Open", className: "text-teal-700" },
  in_review: { label: "In review", className: "text-amber-700" },
  changes: { label: "Changes requested", className: "text-orange-600" },
};

/** "Open", "In review" or "Changes requested", when one applies. */
export function ReviewStateChip({ task }: { task: ReviewTask }) {
  const state = reviewStateOf(task);
  if (!state) return null;
  return <span className={cn("font-medium", STATE_CHIP[state].className)}>{STATE_CHIP[state].label}</span>;
}

/** Claim with a toast; returns whether it worked. */
export function useClaimTask() {
  const { refresh } = useTasksUI();
  return async (task: Pick<TaskDTO, "id" | "title">) => {
    try {
      await tasksApi.claim(task.id);
      toast.success(`You claimed “${task.title}”`);
      refresh();
      return true;
    } catch (e) {
      toast.error((e as Error).message);
      refresh();
      return false;
    }
  };
}

export function ClaimButton({ task, className }: { task: Pick<TaskDTO, "id" | "title">; className?: string }) {
  const claim = useClaimTask();
  const [busy, setBusy] = useState(false);
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={busy}
      className={cn("h-7 px-2.5 text-xs", className)}
      onClick={async (e) => {
        e.stopPropagation();
        setBusy(true);
        await claim(task);
        setBusy(false);
      }}
    >
      Claim
    </Button>
  );
}

/** The assignee hands in a task with a reward: an optional link and note. */
export function SubmitDialog({
  task,
  open,
  onOpenChange,
  onDone,
}: {
  task: Pick<TaskDTO, "id" | "title" | "stars" | "submission">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone?: () => void;
}) {
  const { refresh } = useTasksUI();
  const [link, setLink] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setLink(task.submission?.link ?? "");
      setNote("");
    }
  }, [open, task.submission?.link]);

  const save = async () => {
    setSaving(true);
    try {
      await tasksApi.submit(task.id, { link: link.trim() || null, note: note.trim() || undefined });
      toast.success("Sent for review");
      onOpenChange(false);
      refresh();
      onDone?.();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md tracking-normal">
        <DialogHeader>
          <DialogTitle>Submit for review</DialogTitle>
          <DialogDescription>
            Your department head checks it, and you get {starLabel(task.stars)} once it&apos;s approved.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
          className="space-y-4"
        >
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-gray-600">Link to your work (optional)</span>
            <Input
              autoFocus
              type="url"
              inputMode="url"
              value={link}
              maxLength={2000}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://drive.google.com/…"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-gray-600">Note (optional)</span>
            <AutoTextarea
              value={note}
              maxLength={2000}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything the reviewer should know"
              className="min-h-[72px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-ring"
            />
          </label>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RequestChangesDialog({
  taskId,
  open,
  onOpenChange,
  run,
}: {
  taskId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  run: (fn: () => Promise<unknown>) => Promise<boolean>;
}) {
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setComment("");
  }, [open]);

  const save = async () => {
    const value = comment.trim();
    if (!value) return;
    setSaving(true);
    if (await run(() => tasksApi.requestChanges(taskId, value))) {
      toast.success("Sent back with your comment");
      onOpenChange(false);
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md tracking-normal">
        <DialogHeader>
          <DialogTitle>Request changes</DialogTitle>
          <DialogDescription>Your comment is added to the task, and they can submit again.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
          className="space-y-4"
        >
          <AutoTextarea
            autoFocus
            value={comment}
            maxLength={5000}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What needs changing?"
            aria-label="What needs changing"
            className="min-h-[96px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-ring"
          />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!comment.trim() || saving}>
              Send back
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Whether ReviewBanner has anything to show for this viewer. */
export function hasReviewBanner(task: ReviewTask): boolean {
  if (task.completedAt) return false;
  const { perms } = task;
  return perms.canClaim || perms.canUnclaim || perms.canSubmit || task.submission?.state === "submitted";
}

/**
 * The one line at the top of the detail sheet that says where a claimable or
 * rewarded task stands, with the action the viewer can take.
 */
export function ReviewBanner({ task, run }: { task: ReviewTask; run: (fn: () => Promise<unknown>) => Promise<boolean> }) {
  const [submitting, setSubmitting] = useState(false);
  const [sendingBack, setSendingBack] = useState(false);
  const { perms, submission } = task;
  if (task.completedAt) return null;

  const box = "rounded-lg border px-3 py-2.5 text-sm";
  let body: React.ReactNode = null;

  if (perms.canClaim) {
    body = (
      <div className={cn(box, "flex items-center gap-3 border-teal-200 bg-teal-50/60")}>
        <p className="flex-1 text-teal-900">
          Up for grabs{task.stars ? ` · ${starLabel(task.stars)} when it's approved` : ""}.
        </p>
        <Button size="sm" onClick={() => void run(() => tasksApi.claim(task.id))}>
          Claim
        </Button>
      </div>
    );
  } else if (submission?.state === "submitted") {
    body = (
      <div className={cn(box, "space-y-2 border-amber-200 bg-amber-50/60")}>
        <p className="flex items-center gap-2 text-amber-900">
          {task.assignee && <UserAvatar user={task.assignee} size={18} />}
          {perms.canReview ? `${task.assignee?.name ?? "Someone"} submitted this for review` : "Waiting for review"}
        </p>
        {submission.note && <p className="whitespace-pre-wrap text-gray-700">{submission.note}</p>}
        {submission.link && (
          <a
            href={submission.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-center gap-1 break-all text-blue-700 hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            {submission.link}
          </a>
        )}
        {perms.canReview && (
          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="sm" onClick={() => void run(() => tasksApi.approve(task.id))}>
              Approve{task.stars ? ` · +${task.stars} ★` : ""}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSendingBack(true)}>
              Request changes
            </Button>
          </div>
        )}
      </div>
    );
  } else if (perms.canSubmit) {
    const again = submission?.state === "changes_requested";
    body = (
      <div className={cn(box, "flex items-center gap-3", again ? "border-orange-200 bg-orange-50/60" : "border-gray-200 bg-gray-50/70")}>
        <p className={cn("flex-1", again ? "text-orange-900" : "text-gray-700")}>
          {again
            ? "Changes requested. See the comments, then submit again."
            : `Done? Submit it for review to earn ${starLabel(task.stars)}.`}
        </p>
        <Button size="sm" variant={again ? "default" : "outline"} onClick={() => setSubmitting(true)}>
          {again ? "Submit again" : "Submit"}
        </Button>
      </div>
    );
  }

  return (
    <>
      {body}
      {perms.canUnclaim && (
        <button
          type="button"
          onClick={() => void run(() => tasksApi.unclaim(task.id))}
          className="mt-1.5 text-xs text-gray-500 hover:text-gray-800 hover:underline"
        >
          Hand it back so someone else can claim it
        </button>
      )}
      <SubmitDialog task={task} open={submitting} onOpenChange={setSubmitting} onDone={() => void run(async () => undefined)} />
      <RequestChangesDialog taskId={task.id} open={sendingBack} onOpenChange={setSendingBack} run={run} />
    </>
  );
}
