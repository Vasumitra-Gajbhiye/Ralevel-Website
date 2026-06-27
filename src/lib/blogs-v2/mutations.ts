import type { BlogV2Document } from "@/models/blogV2";
import BlogV2 from "@/models/blogV2";
import { resolveBlogAuthorFromOwnerId } from "@/lib/data/admin/writerProfile";
import connectDB from "@/lib/mongodb";
import type { BlogV2Metadata } from "@/types/blogV2";
import mongoose from "mongoose";
import {
  getWorkingContent,
  hasLiveContent,
  stripClientAuthorFields,
} from "./content";
import { ensureBlogV2Migrated } from "./migrate";
import { logBlogV2ReviewEvent } from "./reviewEvents";
import { assignPermanentSlug } from "./slug";
import {
  applyPendingToLive,
  canApprove,
  canReject,
  canSubmitForReview,
  clearPendingReview,
  resolveReviewType,
  syncDraftFromLive,
} from "./status";

type SaveDraftInput = {
  title?: string;
  metadata?: BlogV2Metadata;
  content?: unknown[];
};

async function applyAuthorMetadata(
  blog: BlogV2Document,
  metadata: BlogV2Metadata,
): Promise<BlogV2Metadata> {
  const ownerId = blog.ownerId?.toString();
  if (!ownerId) return metadata;

  const author = await resolveBlogAuthorFromOwnerId(ownerId);
  if (!author) return metadata;

  return {
    ...metadata,
    author: author.name,
    authorBio: author.bio,
    authorFollowers: author.followerCount,
  };
}

export async function saveBlogV2Draft(
  blog: BlogV2Document,
  input: SaveDraftInput,
): Promise<BlogV2Document> {
  await ensureBlogV2Migrated();

  const title =
    typeof input.title === "string" ? input.title : blog.title;
  const clientMetadata = input.metadata
    ? stripClientAuthorFields(input.metadata)
    : undefined;
  const content = Array.isArray(input.content) ? input.content : undefined;

  if (hasLiveContent(blog)) {
    const currentDraft = getWorkingContent(blog);
    const nextMetadata = clientMetadata
      ? { ...currentDraft.metadata, ...clientMetadata }
      : currentDraft.metadata;

    const resolvedMetadata = await applyAuthorMetadata(blog, nextMetadata);

    blog.draft = {
      title: title || currentDraft.title,
      metadata: resolvedMetadata,
      content: content ?? currentDraft.content,
      updatedAt: new Date(),
    };
  } else {
    if (typeof input.title === "string") {
      blog.title = input.title;
    }
    if (clientMetadata) {
      blog.metadata = { ...(blog.metadata ?? {}), ...clientMetadata };
    }
    if (content) {
      blog.content = content;
    }

    const resolvedMetadata = await applyAuthorMetadata(
      blog,
      blog.metadata ?? {},
    );
    blog.metadata = resolvedMetadata;
  }

  await blog.save();
  return blog;
}

export async function submitBlogV2ForReview(
  blog: BlogV2Document,
  actorId: string,
): Promise<BlogV2Document> {
  await ensureBlogV2Migrated();

  const check = canSubmitForReview(blog);
  if (!check.ok) {
    throw new Error(check.error);
  }

  const working = getWorkingContent(blog);
  const reviewType = resolveReviewType(blog);
  const now = new Date();

  blog.pendingReview = {
    title: working.title,
    metadata: { ...(working.metadata ?? {}) },
    content: Array.isArray(working.content) ? working.content : [],
    updatedAt: now,
    submittedAt: now,
  };
  blog.status = "in_review";
  blog.submittedAt = now;
  blog.reviewType = reviewType;
  blog.reviewNote = null;

  await blog.save();

  await logBlogV2ReviewEvent({
    blogId: blog._id.toString(),
    action: "submitted",
    actorId,
    reviewType,
  });

  return blog;
}

export async function approveBlogV2Review(
  blog: BlogV2Document,
  actorId: string,
): Promise<BlogV2Document> {
  await ensureBlogV2Migrated();

  const check = canApprove(blog);
  if (!check.ok) {
    throw new Error(check.error);
  }

  const reviewType = blog.reviewType ?? resolveReviewType(blog);
  const isFirstPublish = reviewType === "initial";

  if (isFirstPublish) {
    blog.slug = await assignPermanentSlug(blog.pendingReview!.title);
    blog.publishedAt = blog.publishedAt ?? new Date();
  }

  applyPendingToLive(blog);
  clearPendingReview(blog);
  blog.status = "published";
  blog.reviewNote = null;
  blog.reviewedAt = new Date();
  blog.reviewedBy = new mongoose.Types.ObjectId(actorId);
  syncDraftFromLive(blog);

  await blog.save();

  await logBlogV2ReviewEvent({
    blogId: blog._id.toString(),
    action: "approved",
    actorId,
    reviewType,
  });

  return blog;
}

export async function rejectBlogV2Review(
  blog: BlogV2Document,
  actorId: string,
  note: string,
): Promise<BlogV2Document> {
  await ensureBlogV2Migrated();

  const check = canReject(blog);
  if (!check.ok) {
    throw new Error(check.error);
  }

  const reviewType = blog.reviewType ?? resolveReviewType(blog);
  const trimmedNote = note.trim();
  if (!trimmedNote) {
    throw new Error("A rejection note is required.");
  }
  if (trimmedNote.length > 3000) {
    throw new Error("Feedback note must be 3000 characters or fewer.");
  }

  clearPendingReview(blog);
  blog.status = "changes_requested";
  blog.reviewNote = trimmedNote;
  blog.reviewedAt = new Date();
  blog.reviewedBy = new mongoose.Types.ObjectId(actorId);

  await blog.save();

  await logBlogV2ReviewEvent({
    blogId: blog._id.toString(),
    action: "rejected",
    actorId,
    note: trimmedNote,
    reviewType,
  });

  return blog;
}

export async function getBlogV2ById(blogId: string) {
  await ensureBlogV2Migrated();
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(blogId)) return null;
  return BlogV2.findById(blogId);
}
