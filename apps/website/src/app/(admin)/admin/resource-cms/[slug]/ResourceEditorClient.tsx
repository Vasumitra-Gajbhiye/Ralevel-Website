"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import SectionEditor from "../components/SectionEditor";

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

export default function ResourceEditorClient({
  initialData,
}: {
  initialData: ResourceCMSEditorData;
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

  const currentSignature = useMemo(() => draftSignature(draft), [draft]);
  const isDirty = currentSignature !== savedSignature;

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

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to save draft");
      }

      const nextDraft = normalizeDraft(data.draft);
      setDraft(nextDraft);
      setSavedSignature(draftSignature(nextDraft));
      setHasUnpublishedChanges(true);
      toast.success("Draft saved");
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

  async function publishDraft() {
    if (isDirty) {
      const shouldContinue = confirm(
        "You have unsaved local changes. Save draft before publishing?",
      );
      if (!shouldContinue) return;
      const saved = await saveDraft();
      if (!saved) return;
    }

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

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to publish");
      }

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
                {hasUnpublishedChanges ? (
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
            <Button
              variant="outline"
              onClick={saveDraft}
              disabled={!isDirty || isSaving || isPublishing}
            >
              {isSaving ? "Saving..." : "Save draft"}
            </Button>
            <Button onClick={publishDraft} disabled={isSaving || isPublishing}>
              {isPublishing ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>
      </div>

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
          />
        </div>
      </div>
    </div>
  );
}
