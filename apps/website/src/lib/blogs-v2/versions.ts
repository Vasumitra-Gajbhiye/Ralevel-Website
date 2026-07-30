import connectDB from "@/lib/mongodb";
import BlogV2 from "@/models/blogV2";
import type { BlogV2Document } from "@/models/blogV2";
import BlogV2Version from "@/models/blogV2Version";
import type { BlogV2VersionDocument } from "@/models/blogV2Version";
import type {
  BlogV2ContentSnapshot,
  BlogV2ReviewType,
  BlogV2VersionSummary,
} from "@/types/blogV2";
import { format } from "date-fns";
import mongoose from "mongoose";
import { hasLiveContent } from "./content";
import { ensureBlogV2Migrated } from "./migrate";
import { logBlogV2ReviewEvent } from "./reviewEvents";

function formatHistoryDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return format(date, "dd MMM yyyy, HH:mm");
}

export async function getNextVersionNumber(blogId: string): Promise<number> {
  await connectDB();
  const latest = await BlogV2Version.findOne({
    blogId: new mongoose.Types.ObjectId(blogId),
  })
    .sort({ versionNumber: -1 })
    .select("versionNumber")
    .lean<{ versionNumber: number }>();

  return (latest?.versionNumber ?? 0) + 1;
}

export async function createBlogV2VersionOnApprove(params: {
  blog: BlogV2Document;
  actorId: string;
  reviewType: BlogV2ReviewType;
  reviewEventId: string;
}): Promise<{ versionId: string; versionNumber: number }> {
  await connectDB();

  const pending = params.blog.pendingReview;
  if (!pending) {
    throw new Error("No pending review snapshot to version.");
  }

  const versionNumber = await getNextVersionNumber(params.blog._id.toString());
  const approvedAt = new Date();

  const version = await BlogV2Version.create({
    blogId: params.blog._id,
    versionNumber,
    title: pending.title,
    metadata: { ...(pending.metadata ?? {}) },
    content: Array.isArray(pending.content) ? pending.content : [],
    approvedAt,
    approvedBy: new mongoose.Types.ObjectId(params.actorId),
    reviewType: params.reviewType,
    reviewEventId: new mongoose.Types.ObjectId(params.reviewEventId),
  });

  params.blog.lastApprovedBy = new mongoose.Types.ObjectId(params.actorId);
  params.blog.lastApprovedAt = approvedAt;
  params.blog.currentVersionNumber = versionNumber;

  return {
    versionId: version._id.toString(),
    versionNumber,
  };
}

export async function listBlogV2Versions(
  blogId: string,
): Promise<BlogV2VersionSummary[]> {
  await connectDB();
  await ensureBlogV2Migrated();

  if (!mongoose.Types.ObjectId.isValid(blogId)) return [];

  const versions = await BlogV2Version.aggregate([
    { $match: { blogId: new mongoose.Types.ObjectId(blogId) } },
    { $sort: { versionNumber: -1 } },
    {
      $lookup: {
        from: "userdatas",
        localField: "approvedBy",
        foreignField: "_id",
        as: "approver",
      },
    },
    {
      $project: {
        versionNumber: 1,
        title: 1,
        approvedAt: 1,
        approvedBy: 1,
        reviewType: 1,
        approverName: { $arrayElemAt: ["$approver.name", 0] },
        approverEmail: { $arrayElemAt: ["$approver.email", 0] },
      },
    },
  ]);

  return versions.map(
    (v: {
      _id: mongoose.Types.ObjectId;
      versionNumber: number;
      title: string;
      approvedAt: Date;
      approvedBy: mongoose.Types.ObjectId;
      reviewType?: BlogV2ReviewType | null;
      approverName?: string;
      approverEmail?: string;
    }) => ({
      _id: v._id.toString(),
      versionNumber: v.versionNumber,
      title: v.title,
      approvedAt:
        v.approvedAt instanceof Date
          ? v.approvedAt.toISOString()
          : String(v.approvedAt),
      approvedAtLabel: formatHistoryDate(v.approvedAt),
      approvedById: v.approvedBy.toString(),
      approvedByName:
        v.approverName?.trim() ||
        v.approverEmail?.split("@")[0] ||
        "Reviewer",
      reviewType: v.reviewType ?? null,
    }),
  );
}

export async function getBlogV2VersionById(
  blogId: string,
  versionId: string,
) {
  await connectDB();
  if (
    !mongoose.Types.ObjectId.isValid(blogId) ||
    !mongoose.Types.ObjectId.isValid(versionId)
  ) {
    return null;
  }

  return BlogV2Version.findOne({
    _id: new mongoose.Types.ObjectId(versionId),
    blogId: new mongoose.Types.ObjectId(blogId),
  }).lean<BlogV2VersionDocument>();
}

export async function restoreBlogV2Version(
  blog: BlogV2Document,
  versionId: string,
  actorId: string,
): Promise<BlogV2Document> {
  await ensureBlogV2Migrated();

  const version = await getBlogV2VersionById(
    blog._id.toString(),
    versionId,
  );
  if (!version) {
    throw new Error("Version not found.");
  }

  const snapshot: BlogV2ContentSnapshot = {
    title: version.title,
    metadata: { ...(version.metadata ?? {}) },
    content: Array.isArray(version.content) ? version.content : [],
    updatedAt: new Date(),
  };

  if (hasLiveContent(blog)) {
    blog.draft = snapshot;
    if (blog.status !== "changes_requested") {
      blog.status = "draft";
    }
  } else {
    blog.title = snapshot.title;
    blog.metadata = snapshot.metadata;
    blog.content = snapshot.content;
    if (blog.status !== "changes_requested") {
      blog.status = "draft";
    }
  }

  await blog.save();

  await logBlogV2ReviewEvent({
    blogId: blog._id.toString(),
    action: "restored",
    actorId,
    restoredVersionNumber: version.versionNumber,
  });

  return blog;
}

export async function backfillPublishedBlogVersion(
  blog: BlogV2Document,
  actorId?: string,
): Promise<void> {
  await connectDB();

  const blogId = blog._id.toString();
  const existing = await BlogV2Version.findOne({
    blogId: blog._id,
  })
    .select("_id")
    .lean();

  if (existing) return;
  if (!hasLiveContent(blog)) return;

  const approvedAt = blog.publishedAt ?? blog.updatedAt ?? new Date();
  const approvedBy =
    blog.lastApprovedBy ??
    blog.reviewedBy ??
    blog.ownerId;

  await BlogV2Version.create({
    blogId: blog._id,
    versionNumber: 1,
    title: blog.title,
    metadata: { ...(blog.metadata ?? {}) },
    content: Array.isArray(blog.content) ? blog.content : [],
    approvedAt,
    approvedBy,
    reviewType: "initial",
  });

  if (!blog.currentVersionNumber) {
    blog.currentVersionNumber = 1;
  }
  if (!blog.lastApprovedAt) {
    blog.lastApprovedAt = approvedAt;
  }
  if (!blog.lastApprovedBy && approvedBy) {
    blog.lastApprovedBy = approvedBy;
  }

  await blog.save();
}
