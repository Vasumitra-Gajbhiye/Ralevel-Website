"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  canApprove,
  canReject,
  canRequestChanges,
  canRestore,
  canResubmit,
  canWithdraw,
  type ChangeRequestState,
  type ChangeRequestViewer,
} from "@/lib/resource-cms/requests/rules";
import { cn } from "@/lib/utils";
import type {
  ResourceChangeEventItem,
  ResourceChangeEventType,
  ResourceChangePerson,
  ResourceChangeRequestDetail,
} from "@/types/resourceChangeRequests";
import { format, formatDistanceToNow } from "date-fns";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import ChangeList from "../../components/ChangeList";
import NoteDialog from "../../components/NoteDialog";
import RequestStatusBadge from "../../components/RequestStatusBadge";

const personName = (p: ResourceChangePerson) => p.name || p.email;

const EVENT_TEXT: Record<ResourceChangeEventType, string> = {
  submitted: "submitted this for review",
  resubmitted: "resubmitted with changes",
  reviewer_edited: "edited the request",
  comment: "commented",
  changes_requested: "requested changes",
  approved: "approved and published",
  rejected: "rejected this request",
  withdrawn: "withdrew this request",
  restored: "restored this content to the draft",
  published_directly: "published directly",
};

const EVENT_DOT: Partial<Record<ResourceChangeEventType, string>> = {
  approved: "bg-emerald-500",
  rejected: "bg-red-500",
  changes_requested: "bg-orange-500",
  withdrawn: "bg-slate-400",
};

type Action = "approve" | "request-changes" | "reject" | "withdraw" | "resubmit";

const ACTION_DIALOGS: Record<
  Action,
  { title: string; description: string; confirm: string; required?: boolean; destructive?: boolean }
> = {
  approve: {
    title: "Approve and publish",
    description: "These changes go live on the resource page straight away.",
    confirm: "Approve & publish",
  },
  "request-changes": {
    title: "Request changes",
    description: "The author can edit the draft again and resubmit. Tell them what to change.",
    confirm: "Request changes",
    required: true,
  },
  reject: {
    title: "Reject this request",
    description:
      "The request is closed and the subject's draft goes back to the live page. The content is kept here and can be restored later.",
    confirm: "Reject",
    required: true,
    destructive: true,
  },
  withdraw: {
    title: "Withdraw this request",
    description: "The request is closed. Your draft stays as it is, so you can keep editing.",
    confirm: "Withdraw",
  },
  resubmit: {
    title: "Resubmit for review",
    description: "Your saved draft goes back to the reviewer.",
    confirm: "Resubmit",
  },
};

function TimelineItem({ event }: { event: ResourceChangeEventItem }) {
  const isComment = event.type === "comment";
  return (
    <li className="relative pl-6">
      <span
        className={cn(
          "absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full",
          EVENT_DOT[event.type] ?? "bg-slate-300",
        )}
      />
      <p className="text-sm text-slate-700">
        <span className="font-medium text-slate-900">{personName(event.actor)}</span>{" "}
        {EVENT_TEXT[event.type]}
        {event.round && event.type === "resubmitted" ? ` (round ${event.round})` : ""}
        <span
          className="text-slate-400"
          title={format(new Date(event.createdAt), "PPpp")}
        >
          {" · "}
          {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
        </span>
      </p>
      {event.body && (
        <p
          className={cn(
            "mt-1.5 whitespace-pre-wrap rounded-lg p-3 text-sm",
            isComment ? "border border-slate-200 bg-white text-slate-800" : "bg-slate-50 text-slate-700",
          )}
        >
          {event.body}
        </p>
      )}
      {event.changes.length > 0 && (
        <details className="mt-1.5">
          <summary className="cursor-pointer text-xs text-blue-700">
            {event.changes.length} change{event.changes.length === 1 ? "" : "s"}
          </summary>
          <div className="mt-2">
            <ChangeList changes={event.changes} />
          </div>
        </details>
      )}
    </li>
  );
}

export default function RequestDetailClient({
  request,
  viewer,
}: {
  request: ResourceChangeRequestDetail;
  viewer: ChangeRequestViewer;
}) {
  const router = useRouter();
  const [dialog, setDialog] = useState<Action | null>(null);
  const [busy, setBusy] = useState(false);
  const [comment, setComment] = useState("");
  const [view, setView] = useState<"all" | "since">(
    request.sinceLastReview && request.status === "in_review" ? "since" : "all",
  );

  const state: ChangeRequestState = {
    status: request.status,
    authorUserId: request.author.userId,
    approvingAt: request.approvingAt,
  };
  const can = {
    approve: canApprove(state, viewer),
    requestChanges: canRequestChanges(state, viewer),
    reject: canReject(state, viewer),
    withdraw: canWithdraw(state, viewer),
    resubmit: canResubmit(state, viewer),
    restore: canRestore(state, viewer, request.subjectHasOtherOpenRequest),
  };
  const base = `/api/admin/resource-cms/requests/${request.number}`;

  async function post(path: string, body: unknown): Promise<boolean> {
    setBusy(true);
    try {
      const res = await fetch(`${base}/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong");
        if (res.status === 409) router.refresh();
        return false;
      }
      router.refresh();
      return true;
    } finally {
      setBusy(false);
    }
  }

  async function runAction(action: Action, note: string) {
    const body =
      action === "approve" ? { note, expectedHash: request.proposedHash } : { note };
    const ok = await post(action, body);
    if (!ok) return;
    setDialog(null);
    toast.success(
      {
        approve: "Approved and published",
        "request-changes": "Sent back to the author",
        reject: "Request rejected",
        withdraw: "Request withdrawn",
        resubmit: "Back in review",
      }[action],
    );
  }

  async function addComment() {
    if (!comment.trim()) return;
    if (await post("comments", { body: comment.trim() })) setComment("");
  }

  async function restore() {
    if (!confirm("Replace the subject's current draft with this request's content?")) return;
    if (await post("restore", {})) {
      toast.success("Restored to the draft");
      router.push(`/admin/resource-cms/${request.slug}`);
    }
  }

  const shownChanges = view === "since" && request.sinceLastReview ? request.sinceLastReview : request.changes;
  const reviewerActions = can.approve || can.requestChanges || can.reject;
  const dialogConfig = dialog ? ACTION_DIALOGS[dialog] : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-3">
        <Link
          href="/admin/resource-cms/requests"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Change requests
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-slate-900">
              {request.title} <span className="font-normal text-slate-400">#{request.number}</span>
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-slate-500">
              <RequestStatusBadge status={request.status} />
              <span>
                {personName(request.author)} ·{" "}
                <Link href={`/admin/resource-cms/${request.slug}`} className="text-blue-600 hover:underline">
                  {request.subject}
                </Link>{" "}
                · {format(new Date(request.createdAt), "d MMM yyyy")}
              </span>
              {request.status === "approved" && (
                <Link
                  href={`/resources/${request.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                >
                  Live page <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {can.resubmit && (
              <Button asChild variant="outline">
                <Link href={`/admin/resource-cms/${request.slug}`}>Edit draft</Link>
              </Button>
            )}
            {can.resubmit && (
              <Button onClick={() => setDialog("resubmit")} disabled={busy}>
                Resubmit
              </Button>
            )}
            {can.withdraw && (
              <Button variant="outline" onClick={() => setDialog("withdraw")} disabled={busy}>
                Withdraw
              </Button>
            )}
            {can.restore && (
              <Button variant="outline" onClick={restore} disabled={busy}>
                Restore to draft
              </Button>
            )}
          </div>
        </div>
        {request.description && (
          <p className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
            {request.description}
          </p>
        )}
        {request.contributors.length > 1 && (
          <p className="text-xs text-slate-500">
            Includes draft edits by {request.contributors.map(personName).join(", ")}.
          </p>
        )}
        {request.draftDiffers && request.status === "changes_requested" && (
          <p className="text-sm text-orange-700">
            The draft has edits that aren&apos;t in this request yet. They&apos;ll be included when it&apos;s resubmitted.
          </p>
        )}
      </div>

      {reviewerActions && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-4">
          <p className="mr-auto text-sm text-slate-600">
            {request.status === "in_review"
              ? "Review the changes below, then decide."
              : `Waiting for ${personName(request.author)} to revise.`}{" "}
            <Link href={`/admin/resource-cms/${request.slug}`} className="text-blue-600 hover:underline">
              Open in editor
            </Link>
          </p>
          {can.reject && (
            <Button variant="ghost" className="text-red-600" onClick={() => setDialog("reject")} disabled={busy}>
              Reject
            </Button>
          )}
          {can.requestChanges && (
            <Button variant="outline" onClick={() => setDialog("request-changes")} disabled={busy}>
              Request changes
            </Button>
          )}
          {can.approve && (
            <Button onClick={() => setDialog("approve")} disabled={busy}>
              Approve & publish
            </Button>
          )}
        </div>
      )}

      {request.closeNote && !request.open && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-medium text-slate-900">
            {request.closedBy ? personName(request.closedBy) : "Reviewer"}&apos;s note
          </p>
          <p className="mt-1 whitespace-pre-wrap">{request.closeNote}</p>
        </div>
      )}

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-900">
            Changes{" "}
            <span className="font-normal text-slate-400">({shownChanges.length})</span>
          </h2>
          {request.sinceLastReview && (
            <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-sm">
              {(["since", "all"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setView(key)}
                  className={cn(
                    "rounded-md px-3 py-1",
                    view === key ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900",
                  )}
                >
                  {key === "since" ? "Since last review" : "All changes"}
                </button>
              ))}
            </div>
          )}
        </div>
        <ChangeList
          changes={shownChanges}
          emptyText={view === "since" ? "Nothing changed since the last review." : "No content changes."}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900">Activity</h2>
        <ol className="space-y-4">
          {request.events.map((event) => (
            <TimelineItem key={event.id} event={event} />
          ))}
        </ol>
        <div className="space-y-2">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment…"
            rows={3}
            maxLength={3000}
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={addComment} disabled={busy || !comment.trim()}>
              Comment
            </Button>
          </div>
        </div>
      </section>

      {dialogConfig && dialog && (
        <NoteDialog
          open
          onOpenChange={(open) => !open && setDialog(null)}
          title={dialogConfig.title}
          description={dialogConfig.description}
          confirmLabel={dialogConfig.confirm}
          noteRequired={dialogConfig.required}
          destructive={dialogConfig.destructive}
          busy={busy}
          onConfirm={(note) => runAction(dialog, note)}
        />
      )}
    </div>
  );
}
