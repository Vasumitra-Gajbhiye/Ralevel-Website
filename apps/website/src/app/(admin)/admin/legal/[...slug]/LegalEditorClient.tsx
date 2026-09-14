"use client";

import { BlockNoteEditor, BlockNoteViewer } from "@/components/blogs-v2";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminLegalPageEditor } from "@/lib/data/admin/legalPages";
import type { BlockNoteEditor as BlockNoteEditorType } from "@blocknote/core";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

function signature(title: string, content: unknown) {
  return JSON.stringify({ title, content });
}

export default function LegalEditorClient({
  page,
}: {
  page: AdminLegalPageEditor;
}) {
  const editorRef = useRef<BlockNoteEditorType | null>(null);
  const [title, setTitle] = useState(page.title);
  const [hasDraft, setHasDraft] = useState(page.hasDraft);
  const [contentVersion, setContentVersion] = useState(0);
  const [editorKey, setEditorKey] = useState(0);
  const [initialContent, setInitialContent] = useState(page.content);
  const [savedSignature, setSavedSignature] = useState(() =>
    signature(page.title, page.content ?? []),
  );
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewContent, setPreviewContent] = useState<unknown>(page.content);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const handleEditorReady = useCallback(
    (editor: BlockNoteEditorType) => {
      editorRef.current = editor;
      setSavedSignature(signature(title, editor.document));
    },
    [title],
  );

  const handleEditorChange = useCallback(() => {
    setContentVersion((v) => v + 1);
  }, []);

  const currentSignature = useMemo(() => {
    void contentVersion;
    const content = editorRef.current?.document ?? initialContent ?? [];
    return signature(title, content);
  }, [title, contentVersion, initialContent]);

  const isDirty = currentSignature !== savedSignature;

  async function legalRequest(method: string, body: unknown) {
    const res = await fetch(`/api/admin/legal/${page.slug}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        typeof data.error === "string" ? data.error : "Request failed",
      );
    }
    return data as { data: AdminLegalPageEditor };
  }

  async function handleSaveDraft() {
    if (!editorRef.current) {
      toast.error("Editor not ready yet");
      return;
    }

    setSaving(true);
    try {
      const content = editorRef.current.document;
      await legalRequest("PATCH", { title: title.trim() || page.publishedTitle, content });
      setSavedSignature(signature(title, content));
      setHasDraft(true);
      toast.success("Draft saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save draft",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!editorRef.current) {
      toast.error("Editor not ready yet");
      return;
    }

    setPublishing(true);
    try {
      const content = editorRef.current.document;
      const nextTitle = title.trim() || page.publishedTitle;
      await legalRequest("POST", {
        action: "publish",
        title: nextTitle,
        content,
      });
      setTitle(nextTitle);
      setSavedSignature(signature(nextTitle, content));
      setHasDraft(false);
      setConfirmPublish(false);
      toast.success("Published — Last updated is now today");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to publish",
      );
    } finally {
      setPublishing(false);
    }
  }

  async function handleDiscard() {
    setDiscarding(true);
    try {
      const result = await legalRequest("POST", { action: "discard" });
      const next = result.data;
      setTitle(next.title);
      setInitialContent(next.content);
      setSavedSignature(signature(next.title, next.content ?? []));
      setHasDraft(false);
      setEditorKey((k) => k + 1);
      editorRef.current = null;
      setConfirmDiscard(false);
      toast.success("Draft discarded");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to discard draft",
      );
    } finally {
      setDiscarding(false);
    }
  }

  function handlePreview() {
    const content = editorRef.current?.document ?? initialContent;
    setPreviewContent(content);
    setPreviewing(true);
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-neutral-100 bg-white px-4 py-2.5 md:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/admin/legal"
            className="inline-flex shrink-0 items-center gap-1.5 px-2 py-1 text-sm text-neutral-500 transition-colors hover:text-neutral-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          {hasDraft && (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
              Unpublished changes
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={page.path} target="_blank">
              View live
            </Link>
          </Button>
          {previewing ? (
            <Button variant="outline" size="sm" onClick={() => setPreviewing(false)}>
              Back to editor
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={handlePreview}>
              Preview draft
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmDiscard(true)}
            disabled={!hasDraft || discarding || previewing}
          >
            Discard draft
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={!isDirty || saving || previewing}
          >
            {saving ? "Saving…" : "Save draft"}
          </Button>
          <Button
            size="sm"
            onClick={() => setConfirmPublish(true)}
            disabled={publishing || previewing}
          >
            {publishing ? "Publishing…" : "Publish"}
          </Button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-4 py-6 md:px-6">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={previewing}
          className="mb-4 h-12 border-0 px-0 text-3xl font-semibold shadow-none focus-visible:ring-0"
          aria-label="Page title"
        />
        <p className="mb-6 text-sm text-neutral-500">
          Live last updated: {page.lastPublishedLabel ?? "—"}
        </p>

        {previewing ? (
          <div className="rounded-xl border border-neutral-100 bg-white p-2">
            <p className="mb-4 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-800">
              Draft preview — this is not live until you publish.
            </p>
            <div className="bn-notion-editor">
              <BlockNoteViewer
                key={`preview-${contentVersion}-${title}`}
                initialContent={previewContent}
              />
            </div>
          </div>
        ) : (
          <BlockNoteEditor
            key={editorKey}
            initialContent={initialContent}
            onEditorReady={handleEditorReady}
            onChange={handleEditorChange}
          />
        )}
      </div>

      <AlertDialog open={confirmPublish} onOpenChange={setConfirmPublish}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish this page?</AlertDialogTitle>
            <AlertDialogDescription>
              The live {page.path} page will update immediately, and Last
              updated will be set to today.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublish} disabled={publishing}>
              {publishing ? "Publishing…" : "Publish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unpublished changes?</AlertDialogTitle>
            <AlertDialogDescription>
              The editor will revert to the live published version. This cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDiscard}
              disabled={discarding}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {discarding ? "Discarding…" : "Discard draft"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
