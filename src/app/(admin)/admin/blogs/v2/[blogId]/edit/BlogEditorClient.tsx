"use client";

import { BlockNoteEditor } from "@/components/blogs-v2";
import BlogEditorDetailsPopover from "@/components/blogs-v2/BlogEditorDetailsPopover";
import BlogEditorHero from "@/components/blogs-v2/BlogEditorHero";
import BlogPostAuthorProfile from "@/components/blogs-v2/BlogPostAuthorProfile";
import BlogPostFooter from "@/components/blogs-v2/BlogPostFooter";
import BlogPostHeader from "@/components/blogs-v2/BlogPostHeader";
import BlogStatusBadge from "@/components/blogs-v2/BlogStatusBadge";
import type { BlogMetadata } from "@/components/blogs-v2/blogMetadata";
import { Button } from "@/components/ui/button";
import type { ResolvedBlogAuthor } from "@/lib/data/admin/writerProfile";
import { formatBlogMediumDate } from "@/lib/formatBlogDate";
import type { BlogV2ReviewType, BlogV2Status } from "@/types/blogV2";
import type { BlockNoteEditor as BlockNoteEditorType } from "@blocknote/core";
import { AlertCircle, ArrowLeft, Copy } from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

type BlogEditorClientProps = {
  blogId: string;
  initialTitle: string;
  initialMetadata: BlogMetadata;
  authorProfile: ResolvedBlogAuthor | null;
  initialContent?: unknown;
  status: BlogV2Status;
  slug?: string | null;
  previewToken: string;
  reviewNote?: string | null;
  submittedAt?: string | null;
  reviewType?: BlogV2ReviewType | null;
};

export default function BlogEditorClient({
  blogId,
  initialTitle,
  initialMetadata,
  authorProfile,
  initialContent,
  status,
  slug,
  previewToken,
  reviewNote,
  submittedAt,
}: BlogEditorClientProps) {
  const editorRef = useRef<BlockNoteEditorType | null>(null);
  const [title, setTitle] = useState(initialTitle);
  const [metadata, setMetadata] = useState<BlogMetadata>(initialMetadata);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const authorName = authorProfile?.name ?? "Writer";
  const authorBio = authorProfile?.bio;
  const authorFollowers = authorProfile?.followerCount ?? 0;

  const previewUrl = `/blogs/v2/preview/${blogId}?token=${previewToken}`;
  const liveUrl = slug ? `/blogs/v2/${slug}` : null;

  const handleEditorReady = useCallback((editor: BlockNoteEditorType) => {
    editorRef.current = editor;
  }, []);

  const displayDate = metadata.date
    ? formatBlogMediumDate(metadata.date)
    : "";

  async function handleSaveDraft() {
    if (!editorRef.current) {
      toast.error("Editor not ready yet");
      return;
    }

    setSaving(true);
    try {
      const content = editorRef.current.document;
      const saveMetadata: BlogMetadata = {
        ...metadata,
        title: title || metadata.title,
      };

      const res = await fetch(`/api/admin/blogs/v2/${blogId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "Untitled document",
          metadata: saveMetadata,
          content,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save draft");
      }
      toast.success("Draft saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save draft",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitForReview() {
    if (!editorRef.current) {
      toast.error("Editor not ready yet");
      return;
    }

    setSubmitting(true);
    try {
      const content = editorRef.current.document;
      const saveMetadata: BlogMetadata = {
        ...metadata,
        title: title || metadata.title,
      };

      const saveRes = await fetch(`/api/admin/blogs/v2/${blogId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "Untitled document",
          metadata: saveMetadata,
          content,
        }),
      });

      if (!saveRes.ok) {
        const data = await saveRes.json();
        throw new Error(data.error ?? "Failed to save draft before submitting");
      }

      const res = await fetch(`/api/admin/blogs/v2/${blogId}/submit-review`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to submit for review");
      }
      toast.success(
        status === "in_review"
          ? "Updated version sent for review"
          : "Submitted for review",
      );
      window.location.reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit for review",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function copyPreviewLink() {
    const fullUrl = `${window.location.origin}${previewUrl}`;
    void navigator.clipboard.writeText(fullUrl);
    toast.success("Preview link copied");
  }

  const submitLabel =
    status === "in_review"
      ? "Push to review"
      : status === "published"
        ? "Submit changes for review"
        : status === "changes_requested"
          ? "Submit for review"
          : "Publish";

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      <header className="flex items-center justify-between gap-4 px-4 md:px-6 py-2.5 border-b border-neutral-100 bg-white shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/admin/blogs/v2"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors shrink-0 px-2 py-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <BlogStatusBadge status={status} />
          <BlogEditorDetailsPopover
            metadata={metadata}
            authorName={authorName}
            onMetadataChange={setMetadata}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {liveUrl && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={liveUrl} target="_blank">
                View live
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="sm" asChild>
            <Link href={previewUrl} target="_blank">
              Preview
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={copyPreviewLink}>
            <Copy className="h-3.5 w-3.5" />
            Copy preview link
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save draft"}
          </Button>
          <Button size="sm" onClick={handleSubmitForReview} disabled={submitting}>
            {submitting ? "Submitting…" : submitLabel}
          </Button>
        </div>
      </header>

      {(reviewNote || (status === "in_review" && submittedAt)) && (
        <div className="px-4 md:px-6 py-3 border-b border-neutral-100 bg-neutral-50/80">
          {reviewNote && (
            <div className="mb-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
              <div className="flex items-center gap-2 font-medium">
                <AlertCircle className="h-4 w-4" />
                Changes requested
              </div>
              <p className="mt-1">{reviewNote}</p>
            </div>
          )}
          {status === "in_review" && submittedAt && (
            <p className="text-sm text-neutral-600">
              In review since {formatBlogMediumDate(submittedAt)}. You can still
              edit your draft and push an updated version for reviewers.
            </p>
          )}
        </div>
      )}

      {slug && (
        <div className="px-4 md:px-6 py-2 border-b border-neutral-100 text-sm text-neutral-600">
          Permanent URL:{" "}
          <Link href={liveUrl!} className="text-blue-600 hover:underline" target="_blank">
            /blogs/v2/{slug}
          </Link>
        </div>
      )}

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="relative flex flex-col items-center my-12 md:my-16 px-5 md:px-10 pb-16">
          <div className="w-full max-w-3xl">
            <BlogPostHeader
              title={title}
              onTitleChange={setTitle}
              description={metadata.description}
              onDescriptionChange={(description) =>
                setMetadata((m) => ({ ...m, description }))
              }
              author={authorName}
              authorAvatar={authorProfile?.avatar}
              displayDate={displayDate}
              readTimeMinutes={metadata.readTimeMinutes}
            />

            <BlogEditorHero
              blogId={blogId}
              image={metadata.image ?? ""}
              onImageChange={(image) =>
                setMetadata((m) => ({ ...m, image }))
              }
            />
          </div>

          <div className="w-full max-w-3xl mt-10 leading-8 text-slate-800 tracking-wide">
            <BlockNoteEditor
              key={blogId}
              initialContent={initialContent}
              onEditorReady={handleEditorReady}
            />
            <BlogPostFooter tag={metadata.tag} />
            <BlogPostAuthorProfile
              author={authorName}
              authorAvatar={authorProfile?.avatar}
              authorBio={authorBio}
              authorFollowers={authorFollowers}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
