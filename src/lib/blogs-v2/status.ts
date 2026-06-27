import type { BlogV2Document } from "@/models/blogV2";
import type { BlogV2ReviewType, BlogV2Status } from "@/types/blogV2";
import {
  buildSnapshotFromBlog,
  getWorkingContent,
  hasLiveContent,
  hasSubmittableContent,
} from "./content";

export function resolveReviewType(blog: BlogV2Document): BlogV2ReviewType {
  return hasLiveContent(blog) ? "update" : "initial";
}

export function canSubmitForReview(blog: BlogV2Document): {
  ok: boolean;
  error?: string;
} {
  const working = getWorkingContent(blog);
  if (!hasSubmittableContent(working)) {
    return {
      ok: false,
      error: "Add a title and content before submitting for review.",
    };
  }

  const allowedStatuses: BlogV2Status[] = [
    "draft",
    "changes_requested",
    "published",
    "in_review",
  ];

  if (!allowedStatuses.includes(blog.status)) {
    return { ok: false, error: "This blog cannot be submitted for review." };
  }

  return { ok: true };
}

export function canApprove(blog: BlogV2Document): { ok: boolean; error?: string } {
  if (!blog.pendingReview) {
    return { ok: false, error: "No pending review snapshot to approve." };
  }
  if (blog.status !== "in_review") {
    return { ok: false, error: "Blog is not in review." };
  }
  return { ok: true };
}

export function canReject(blog: BlogV2Document): { ok: boolean; error?: string } {
  if (!blog.pendingReview) {
    return { ok: false, error: "No pending review snapshot to reject." };
  }
  if (blog.status !== "in_review") {
    return { ok: false, error: "Blog is not in review." };
  }
  return { ok: true };
}

export function applyPendingToLive(blog: BlogV2Document): void {
  if (!blog.pendingReview) return;

  blog.title = blog.pendingReview.title;
  blog.metadata = { ...(blog.pendingReview.metadata ?? {}) };
  blog.content = Array.isArray(blog.pendingReview.content)
    ? blog.pendingReview.content
    : [];
}

export function clearPendingReview(blog: BlogV2Document): void {
  blog.pendingReview = null;
  blog.submittedAt = null;
  blog.reviewType = null;
}

export function syncDraftFromLive(blog: BlogV2Document): void {
  if (!hasLiveContent(blog)) return;
  blog.draft = buildSnapshotFromBlog(blog);
}
