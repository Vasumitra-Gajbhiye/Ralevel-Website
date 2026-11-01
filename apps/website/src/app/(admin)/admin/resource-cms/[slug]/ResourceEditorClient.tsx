"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  diffCMSSections,
  extractCMSSections,
  groupResourceCmsChanges,
  summarizeChanges,
} from "@/lib/resource-cms/diff";
import {
  draftEditMode,
  type ChangeRequestViewer,
} from "@/lib/resource-cms/requests/rules";
import type { OpenResourceChangeRequest } from "@/types/resourceChangeRequests";
import type {
  EditableSection,
  ResourceCMSEditorData,
  ResourceDraft,
} from "@/types/resources2";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import NoteDialog from "../components/NoteDialog";
import RequestStatusBadge from "../components/RequestStatusBadge";
import SectionEditor from "../components/SectionEditor";
import SubmitForReviewDialog from "../components/SubmitForReviewDialog";

const SECTIONS: { id: EditableSection; label: string }[] = [
  { id: "syllabus", label: "Syllabus" },
  { id: "notes", label: "Notes" },
  { id: "worksheets", label: "Worksheets" },
  { id: "tools", label: "Tools" },
  { id: "books", label: "Books" },
  { id: "youtubeChannel", label: "YouTube Channels" },
  { id: "youtubePlaylist", label: "Playlists & Videos" },
];

function draftSignature(draft: ResourceDraft) {
  return JSON.stringify({
    syllabus: draft.syllabus,
    notes: draft.notes,
    worksheets: draft.worksheets,
    tools: draft.tools,
    books: draft.books,
    youtubeChannel: draft.youtubeChannel,
    youtubePlaylist: draft.youtubePlaylist,
  });
}

function normalizeDraft(draft: ResourceDraft): ResourceDraft {
  return {
    syllabus: draft.syllabus ?? [],
    notes: draft.notes ?? [],
    worksheets: draft.worksheets ?? [],
    tools: draft.tools ?? [],
    books: draft.books ?? [],
    youtubeChannel: draft.youtubeChannel ?? [],
    youtubePlaylist: draft.youtubePlaylist ?? [],
    updatedAt: draft.updatedAt,
    updatedBy: draft.updatedBy,
  };
}

/** Reads the error from a failed response; a 409 means the page is out of date. */
async function failure(res: Response, fallback: string) {
  const data = await res.json().catch(() => ({}));
  return { message: (data as { error?: string }).error ?? fallback, conflict: res.status === 409 };
}

function RequestBanner({
  openRequest,
  mode,
}: {
  openRequest: OpenResourceChangeRequest;
  mode: ReturnType<typeof draftEditMode>;
}) {
  const href = `/admin/resource-cms/requests/${openRequest.number}`;
  const link = (
    <Link href={href} className="font-medium text-blue-700 hover:underline">
      Request #{openRequest.number}
    </Link>
  );

  if (openRequest.status === "changes_requested" && mode === "author") {
    return (
      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">
        <p className="font-medium">
          Changes requested on {link}
          {openRequest.latestFeedback && <> by {openRequest.latestFeedback.by}</>}
        </p>
        {openRequest.latestFeedback?.body && (
          <p className="mt-2 whitespace-pre-wrap">{openRequest.latestFeedback.body}</p>
        )}
        <p className="mt-2 text-orange-800">Edit, save, then resubmit.</p>
      </div>
    );
  }

  const text =
    mode === "reviewer"
      ? openRequest.status === "in_review"
        ? <>{link} by {openRequest.authorName} is waiting for review. Your saves are added to it.</>
        : <>{link} is back with {openRequest.authorName} for changes.</>
      : openRequest.status === "in_review"
        ? <>{link} by {openRequest.authorName} is in review, so this subject is read-only for now.</>
        : <>{openRequest.authorName} is revising {link}, so this subject is read-only for now.</>;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
      {text}
    </div>
  );
}

export default function ResourceEditorClient({
  initialData,
  openRequest,
  viewer,
}: {
  initialData: ResourceCMSEditorData;
  openRequest: OpenResourceChangeRequest | null;
  viewer: ChangeRequestViewer;
}) {
  const router = useRouter();
  const [activeSection, setActiveSection] =
    useState<EditableSection>("syllabus");
  const [draft, setDraft] = useState<ResourceDraft>(
    normalizeDraft(initialData.draft),
  );
  const [savedSignature, setSavedSignature] = useState(() =>
    draftSignature(normalizeDraft(initialData.draft)),
  );
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(
    initialData.hasUnpublishedChanges,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [resubmitOpen, setResubmitOpen] = useState(false);

  // Keep local state in step with the server after router.refresh().
  useEffect(() => {
    const next = normalizeDraft(initialData.draft);
    setDraft(next);
    setSavedSignature(draftSignature(next));
    setHasUnpublishedChanges(initialData.hasUnpublishedChanges);
  }, [initialData]);

  const mode = draftEditMode(
    openRequest
      ? {
          status: openRequest.status,
          authorUserId: openRequest.authorUserId,
          approvingAt: openRequest.approvingAt,
        }
      : null,
    viewer,
  );
  const readOnly = mode === "locked";

  const currentSignature = useMemo(() => draftSignature(draft), [draft]);
  const isDirty = !readOnly && currentSignature !== savedSignature;

  const pendingChanges = useMemo(() => {
    const raw = diffCMSSections(initialData.live, extractCMSSections(draft));
    return { grouped: groupResourceCmsChanges(raw), summary: summarizeChanges(raw) };
  }, [initialData.live, draft]);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleBack = useCallback(() => {
    if (
      isDirty &&
      !confirm("You have unsaved changes. Leave without saving?")
    ) {
      return;
    }
    router.push("/admin/resource-cms");
  }, [isDirty, router]);

  function updateSection(
    section: EditableSection,
    items: Record<string, unknown>[],
  ) {
    setDraft((prev) => ({
      ...prev,
      [section]: items,
    }));
  }

  async function saveDraft(): Promise<boolean> {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/resource-cms/${initialData.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          syllabus: draft.syllabus,
          notes: draft.notes,
          worksheets: draft.worksheets,
          tools: draft.tools,
          books: draft.books,
          youtubeChannel: draft.youtubeChannel,
          youtubePlaylist: draft.youtubePlaylist,
        }),
      });

      if (!res.ok) {
        const { message, conflict } = await failure(res, "Failed to save draft");
        toast.error(message);
        // Someone submitted or reviewed meanwhile: show the current state.
        if (conflict) router.refresh();
        return false;
      }

      const data = await res.json();
      const nextDraft = normalizeDraft(data.draft);
      setDraft(nextDraft);
      setSavedSignature(draftSignature(nextDraft));
      setHasUnpublishedChanges(true);
      toast.success(mode === "reviewer" && openRequest?.status === "in_review"
        ? `Saved and added to request #${openRequest.number}`
        : "Draft saved");
      if (mode === "reviewer") router.refresh();
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save draft",
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  /** Saves unsaved edits first; returns false if that fails or is cancelled. */
  async function saveIfDirty(action: string): Promise<boolean> {
    if (!isDirty) return true;
    if (!confirm(`You have unsaved changes. Save them and ${action}?`)) return false;
    return saveDraft();
  }

  async function publishDraft() {
    if (!(await saveIfDirty("publish"))) return;

    if (
      !confirm(
        `Publish changes for ${initialData.subject}? This will update the live resource page.`,
      )
    ) {
      return;
    }

    setIsPublishing(true);
    try {
      const res = await fetch(
        `/api/admin/resource-cms/${initialData.slug}/publish`,
        { method: "POST" },
      );

      if (!res.ok) {
        const { message, conflict } = await failure(res, "Failed to publish");
        toast.error(message);
        if (conflict) router.refresh();
        return;
      }

      const data = await res.json();
      setHasUnpublishedChanges(false);
      setSavedSignature(currentSignature);
      toast.success(`Published — live at ${data.liveUrl}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to publish");
    } finally {
      setIsPublishing(false);
    }
  }

  async function openSubmit() {
    if (!(await saveIfDirty("submit them for review"))) return;
    if (pendingChanges.grouped.length === 0) {
      toast.info("The draft matches the live page, so there's nothing to submit.");
      return;
    }
    setSubmitOpen(true);
  }

  async function openResubmit() {
    if (!(await saveIfDirty("resubmit"))) return;
    setResubmitOpen(true);
  }

  async function resubmit(note: string) {
    if (!openRequest) return;
    setIsPublishing(true);
    try {
      const res = await fetch(
        `/api/admin/resource-cms/requests/${openRequest.number}/resubmit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note }),
        },
      );
      if (!res.ok) {
        const { message } = await failure(res, "Couldn't resubmit");
        toast.error(message);
        return;
      }
      toast.success(`Request #${openRequest.number} is back in review`);
      setResubmitOpen(false);
      router.push(`/admin/resource-cms/requests/${openRequest.number}`);
    } finally {
      setIsPublishing(false);
    }
  }

  const busy = isSaving || isPublishing;
  const sectionItems = draft[activeSection] as Record<string, unknown>[];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="sticky top-0 z-10 -mx-2 border-b border-slate-200 bg-gray-50/95 px-2 py-4 backdrop-blur">
        <div className="flex flex-row gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold text-slate-900">
                  {initialData.subject}
                </h1>
                {openRequest ? (
                  <RequestStatusBadge status={openRequest.status} />
                ) : hasUnpublishedChanges ? (
                  <Badge variant="secondary">Unpublished changes</Badge>
                ) : (
                  <Badge variant="outline">Published</Badge>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span>/{initialData.slug}</span>
                <Link
                  href={`/resources/${initialData.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                >
                  View live page
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={`/admin/resource-cms/history?slug=${initialData.slug}`}
                  className="text-blue-600 hover:underline"
                >
                  View history
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!readOnly && (
              <Button
                variant="outline"
                onClick={saveDraft}
                disabled={!isDirty || busy}
              >
                {isSaving ? "Saving..." : "Save draft"}
              </Button>
            )}
            {openRequest ? (
              mode === "author" ? (
                <Button onClick={openResubmit} disabled={busy}>
                  Resubmit
                </Button>
              ) : (
                <Button asChild variant={mode === "reviewer" ? "default" : "outline"}>
                  <Link href={`/admin/resource-cms/requests/${openRequest.number}`}>
                    {mode === "reviewer" && openRequest.status === "in_review"
                      ? "Review request"
                      : `View request #${openRequest.number}`}
                  </Link>
                </Button>
              )
            ) : viewer.canPublish ? (
              <Button onClick={publishDraft} disabled={busy}>
                {isPublishing ? "Publishing..." : "Publish"}
              </Button>
            ) : (
              <Button onClick={openSubmit} disabled={busy}>
                Submit for review
              </Button>
            )}
          </div>
        </div>
      </div>

      {openRequest && <RequestBanner openRequest={openRequest} mode={mode} />}

      <div className="flex flex-col gap-6">
        <aside className="lg:w-52">
          <nav className="flex gap-2 overflow-x-auto  lg:overflow-visible">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "rounded-lg px-3 py-2 text-left text-sm font-medium whitespace-nowrap transition",
                  activeSection === section.id
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100",
                )}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <SectionEditor
            key={activeSection}
            section={activeSection}
            slug={initialData.slug}
            items={sectionItems}
            onChange={(items) => updateSection(activeSection, items)}
            readOnly={readOnly}
          />
        </div>
      </div>

      <SubmitForReviewDialog
        open={submitOpen}
        onOpenChange={setSubmitOpen}
        slug={initialData.slug}
        subject={initialData.subject}
        changes={pendingChanges.grouped}
        suggestedTitle={pendingChanges.summary}
      />

      <NoteDialog
        open={resubmitOpen}
        onOpenChange={setResubmitOpen}
        title={`Resubmit request #${openRequest?.number ?? ""}`}
        description="Your saved draft goes back to the reviewer. Say what you changed."
        placeholder="What did you change? (optional)"
        confirmLabel="Resubmit"
        busy={isPublishing}
        onConfirm={resubmit}
      />
    </div>
  );
}
