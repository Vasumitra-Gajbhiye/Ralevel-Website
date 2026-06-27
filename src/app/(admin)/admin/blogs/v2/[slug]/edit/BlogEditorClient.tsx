"use client";

import { BlockNoteEditor } from "@/components/blogs-v2";
import BlogEditorDetailsPopover from "@/components/blogs-v2/BlogEditorDetailsPopover";
import BlogEditorHero from "@/components/blogs-v2/BlogEditorHero";
import BlogPostAuthorProfile from "@/components/blogs-v2/BlogPostAuthorProfile";
import BlogPostFooter from "@/components/blogs-v2/BlogPostFooter";
import BlogPostHeader from "@/components/blogs-v2/BlogPostHeader";
import type { BlogMetadata } from "@/components/blogs-v2/blogMetadata";
import { Button } from "@/components/ui/button";
import type { ResolvedBlogAuthor } from "@/lib/data/admin/writerProfile";
import { formatBlogMediumDate } from "@/lib/formatBlogDate";
import type { BlockNoteEditor as BlockNoteEditorType } from "@blocknote/core";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

type BlogEditorClientProps = {
  slug: string;
  initialTitle: string;
  initialMetadata: BlogMetadata;
  authorProfile: ResolvedBlogAuthor | null;
  initialContent?: unknown;
};

export default function BlogEditorClient({
  slug,
  initialTitle,
  initialMetadata,
  authorProfile,
  initialContent,
}: BlogEditorClientProps) {
  const editorRef = useRef<BlockNoteEditorType | null>(null);
  const [title, setTitle] = useState(initialTitle);
  const [metadata, setMetadata] = useState<BlogMetadata>(initialMetadata);
  const [saving, setSaving] = useState(false);

  const authorName = authorProfile?.name ?? "Writer";
  const authorBio = authorProfile?.bio;
  const authorFollowers = authorProfile?.followerCount ?? 0;

  const handleEditorReady = useCallback((editor: BlockNoteEditorType) => {
    editorRef.current = editor;
  }, []);

  const displayDate = metadata.date
    ? formatBlogMediumDate(metadata.date)
    : "";

  async function handleSave() {
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

      const res = await fetch(`/api/admin/blogs/v2/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "Untitled document",
          metadata: saveMetadata,
          content,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      toast.success("Blog saved");
    } catch {
      toast.error("Failed to save blog");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      <header className="flex items-center justify-between gap-4 px-4 md:px-6 py-2.5 border-b border-neutral-100 bg-white shrink-0">
        <div className="flex items-center gap-1 min-w-0">
          <Link
            href="/admin/blogs/v2"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors shrink-0 px-2 py-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <BlogEditorDetailsPopover
            metadata={metadata}
            authorName={authorName}
            onMetadataChange={setMetadata}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/blogs/v2/${slug}`} target="_blank">
              Preview
            </Link>
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </header>

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
              slug={slug}
              image={metadata.image ?? ""}
              onImageChange={(image) =>
                setMetadata((m) => ({ ...m, image }))
              }
            />
          </div>

          <div className="w-full max-w-3xl mt-10 leading-8 text-slate-800 tracking-wide">
            <BlockNoteEditor
              key={slug}
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
