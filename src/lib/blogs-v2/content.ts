import type { BlogV2Document } from "@/models/blogV2";
import type {
  BlogV2ContentSnapshot,
  BlogV2Metadata,
} from "@/types/blogV2";

export function hasLiveContent(
  blog: Pick<BlogV2Document, "slug" | "publishedAt">,
): boolean {
  return Boolean(blog.slug && blog.publishedAt);
}

export function isDraftEmpty(draft?: BlogV2ContentSnapshot | null): boolean {
  if (!draft) return true;
  const hasContent = Array.isArray(draft.content) && draft.content.length > 0;
  const hasTitle =
    Boolean(draft.title?.trim()) && draft.title.trim() !== "Untitled document";
  return !hasContent && !hasTitle;
}

export function buildSnapshotFromBlog(
  blog: Pick<BlogV2Document, "title" | "metadata" | "content">,
): BlogV2ContentSnapshot {
  return {
    title: blog.title,
    metadata: { ...(blog.metadata ?? {}) },
    content: Array.isArray(blog.content) ? [...blog.content] : [],
    updatedAt: new Date(),
  };
}

export function buildDraftFromLive(
  blog: Pick<BlogV2Document, "title" | "metadata" | "content">,
): BlogV2ContentSnapshot {
  return buildSnapshotFromBlog(blog);
}

export function getWorkingContent(
  blog: BlogV2Document,
): BlogV2ContentSnapshot {
  if (hasLiveContent(blog)) {
    if (!isDraftEmpty(blog.draft)) {
      return {
        title: blog.draft!.title,
        metadata: { ...(blog.draft!.metadata ?? {}) },
        content: Array.isArray(blog.draft!.content) ? blog.draft!.content : [],
        updatedAt: blog.draft!.updatedAt,
      };
    }
    return buildDraftFromLive(blog);
  }

  return {
    title: blog.title,
    metadata: { ...(blog.metadata ?? {}) },
    content: Array.isArray(blog.content) ? blog.content : [],
    updatedAt: blog.updatedAt,
  };
}

export function getLiveContent(
  blog: BlogV2Document,
): BlogV2ContentSnapshot | null {
  if (!hasLiveContent(blog)) return null;
  return buildSnapshotFromBlog(blog);
}

export function getPendingContent(
  blog: BlogV2Document,
): BlogV2ContentSnapshot | null {
  if (!blog.pendingReview) return null;
  return {
    title: blog.pendingReview.title,
    metadata: { ...(blog.pendingReview.metadata ?? {}) },
    content: Array.isArray(blog.pendingReview.content)
      ? blog.pendingReview.content
      : [],
    updatedAt: blog.pendingReview.updatedAt,
  };
}

export function getPreviewContent(blog: BlogV2Document): BlogV2ContentSnapshot {
  return getWorkingContent(blog);
}

export function stripClientAuthorFields(
  metadata: BlogV2Metadata,
): BlogV2Metadata {
  const {
    author: _author,
    authorBio: _bio,
    authorFollowers: _followers,
    ...clientMetadata
  } = metadata;
  return clientMetadata;
}

export function hasSubmittableContent(snapshot: BlogV2ContentSnapshot): boolean {
  const title = snapshot.title?.trim();
  const hasTitle = Boolean(title) && title !== "Untitled document";
  const hasContent =
    Array.isArray(snapshot.content) && snapshot.content.length > 0;
  return hasTitle && hasContent;
}
