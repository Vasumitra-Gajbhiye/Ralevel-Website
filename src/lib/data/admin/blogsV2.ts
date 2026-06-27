import { getWorkingContent } from "@/lib/blogs-v2/content";
import { ensureBlogV2Migrated } from "@/lib/blogs-v2/migrate";
import connectDB from "@/lib/mongodb";
import { buildPaginatedResponse, type PaginatedResult } from "@/lib/pagination";
import type { Role } from "@/lib/roles";
import { hasWriterTeamRole } from "@/lib/roles";
import BlogV2 from "@/models/blogV2";
import type { BlogV2Doc } from "@/lib/data/blogsV2";
import {
  resolveBlogAuthorFromOwnerId,
  getWriterProfile,
  type ResolvedBlogAuthor,
} from "@/lib/data/admin/writerProfile";
import type { BlogV2ReviewType, BlogV2Status } from "@/types/blogV2";
import { format } from "date-fns";
import mongoose from "mongoose";

export type AdminBlogV2 = {
  _id: string;
  title: string;
  slug?: string | null;
  status: BlogV2Status;
  updatedAt: string;
  updatedAtLabel: string;
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
  submittedAt?: string | null;
  reviewType?: BlogV2ReviewType | null;
};

export type PendingBlogReview = AdminBlogV2 & {
  submittedAtLabel: string;
  reviewType: BlogV2ReviewType;
  pendingTitle: string;
};

function formatUpdatedAt(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return format(date, "dd/MM/yyyy");
}

function serializeAdminBlog(blog: {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug?: string | null;
  status?: BlogV2Status;
  updatedAt: Date;
  ownerId?: mongoose.Types.ObjectId;
  ownerName?: string;
  ownerEmail?: string;
  submittedAt?: Date | null;
  reviewType?: BlogV2ReviewType | null;
}): AdminBlogV2 {
  return {
    _id: blog._id.toString(),
    title: blog.title,
    slug: blog.slug ?? null,
    status: blog.status ?? "draft",
    updatedAt:
      blog.updatedAt instanceof Date
        ? blog.updatedAt.toISOString()
        : String(blog.updatedAt),
    updatedAtLabel: formatUpdatedAt(blog.updatedAt),
    ownerId: blog.ownerId?.toString(),
    ownerName: blog.ownerName,
    ownerEmail: blog.ownerEmail,
    submittedAt: blog.submittedAt
      ? blog.submittedAt instanceof Date
        ? blog.submittedAt.toISOString()
        : String(blog.submittedAt)
      : null,
    reviewType: blog.reviewType ?? null,
  };
}

type GetAdminBlogsV2ListParams = {
  page: number;
  limit: number;
  skip: number;
  userId: string;
};

export async function getAdminBlogsV2List({
  page,
  limit,
  skip,
  userId,
}: GetAdminBlogsV2ListParams): Promise<PaginatedResult<AdminBlogV2>> {
  await connectDB();
  await ensureBlogV2Migrated();

  const match = { ownerId: new mongoose.Types.ObjectId(userId) };

  const [result] = await BlogV2.aggregate([
    { $match: match },
    {
      $lookup: {
        from: "userdatas",
        localField: "ownerId",
        foreignField: "_id",
        as: "owner",
      },
    },
    { $unwind: "$owner" },
    {
      $project: {
        title: 1,
        slug: 1,
        status: 1,
        updatedAt: 1,
        ownerId: 1,
        submittedAt: 1,
        reviewType: 1,
        ownerName: "$owner.name",
        ownerEmail: "$owner.email",
      },
    },
    { $sort: { updatedAt: -1 } },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    },
  ]);

  const total = result.metadata[0]?.total ?? 0;
  const data: AdminBlogV2[] = result.data.map(serializeAdminBlog);

  return buildPaginatedResponse(data, total, page, limit);
}

export type AdminBlogV2Detail = {
  _id: string;
  title: string;
  slug?: string | null;
  status: BlogV2Status;
  metadata?: {
    title?: string;
    author?: string;
    date?: string;
    tag?: string;
    image?: string;
    description?: string;
    readTimeMinutes?: number;
    authorBio?: string;
    authorFollowers?: number;
  };
  author: ResolvedBlogAuthor | null;
  content: unknown[];
  ownerId?: string;
  previewToken: string;
  reviewNote?: string | null;
  submittedAt?: string | null;
  reviewType?: BlogV2ReviewType | null;
  lastApprovedByName?: string | null;
  lastApprovedAt?: string | null;
  currentVersionNumber?: number | null;
};

export async function getAdminBlogV2ById(
  blogId: string,
  userId: string,
  roles: Role[],
): Promise<AdminBlogV2Detail | null> {
  await connectDB();
  await ensureBlogV2Migrated();

  if (!hasWriterTeamRole(roles)) {
    return null;
  }

  if (!mongoose.Types.ObjectId.isValid(blogId)) {
    return null;
  }

  const isAdminLike = roles.some((r) => r === "admin" || r === "owner");

  const query = isAdminLike
    ? { _id: new mongoose.Types.ObjectId(blogId) }
    : {
        _id: new mongoose.Types.ObjectId(blogId),
        ownerId: new mongoose.Types.ObjectId(userId),
      };

  const blog = await BlogV2.findOne(query).lean<BlogV2Doc & {
    status?: BlogV2Status;
    previewToken?: string;
    reviewNote?: string | null;
    submittedAt?: Date;
    reviewType?: BlogV2ReviewType | null;
    lastApprovedBy?: mongoose.Types.ObjectId;
    lastApprovedAt?: Date;
    currentVersionNumber?: number | null;
    draft?: { title: string; metadata?: BlogV2Doc["metadata"]; content?: unknown[] };
  }>();

  if (!blog) return null;

  const ownerId = blog.ownerId?.toString();
  const author = ownerId ? await resolveBlogAuthorFromOwnerId(ownerId) : null;
  const working = getWorkingContent(blog as Parameters<typeof getWorkingContent>[0]);

  let lastApprovedByName: string | null = null;
  if (blog.lastApprovedBy) {
    const approver = await getWriterProfile(blog.lastApprovedBy.toString());
    if (approver) {
      lastApprovedByName = approver.name;
    }
  }

  return {
    _id: blog._id.toString(),
    title: working.title,
    slug: blog.slug ?? null,
    status: blog.status ?? "draft",
    metadata: working.metadata ?? {},
    author,
    content: working.content ?? [],
    ownerId,
    previewToken: blog.previewToken ?? "",
    reviewNote: blog.reviewNote ?? null,
    submittedAt: blog.submittedAt
      ? blog.submittedAt instanceof Date
        ? blog.submittedAt.toISOString()
        : String(blog.submittedAt)
      : null,
    reviewType: blog.reviewType ?? null,
    lastApprovedByName,
    lastApprovedAt: blog.lastApprovedAt
      ? blog.lastApprovedAt instanceof Date
        ? blog.lastApprovedAt.toISOString()
        : String(blog.lastApprovedAt)
      : null,
    currentVersionNumber: blog.currentVersionNumber ?? null,
  };
}

type GetPendingBlogReviewsParams = {
  page: number;
  limit: number;
  skip: number;
};

export async function getPendingBlogReviews({
  page,
  limit,
  skip,
}: GetPendingBlogReviewsParams): Promise<PaginatedResult<PendingBlogReview>> {
  await connectDB();
  await ensureBlogV2Migrated();

  const [result] = await BlogV2.aggregate([
    { $match: { status: "in_review" } },
    {
      $lookup: {
        from: "userdatas",
        localField: "ownerId",
        foreignField: "_id",
        as: "owner",
      },
    },
    { $unwind: "$owner" },
    {
      $project: {
        title: 1,
        slug: 1,
        status: 1,
        updatedAt: 1,
        ownerId: 1,
        submittedAt: 1,
        reviewType: 1,
        pendingReview: 1,
        ownerName: "$owner.name",
        ownerEmail: "$owner.email",
      },
    },
    { $sort: { submittedAt: 1 } },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    },
  ]);

  const total = result.metadata[0]?.total ?? 0;
  const data: PendingBlogReview[] = result.data.map(
    (blog: {
      _id: mongoose.Types.ObjectId;
      title: string;
      slug?: string | null;
      status?: BlogV2Status;
      updatedAt: Date;
      ownerId?: mongoose.Types.ObjectId;
      submittedAt?: Date | null;
      reviewType?: BlogV2ReviewType | null;
      pendingReview?: { title?: string };
      ownerName?: string;
      ownerEmail?: string;
    }) => {
      const base = serializeAdminBlog(blog);
      const submittedAt = blog.submittedAt ?? blog.updatedAt;
      return {
        ...base,
        submittedAtLabel: formatUpdatedAt(submittedAt),
        reviewType: blog.reviewType ?? "initial",
        pendingTitle: blog.pendingReview?.title ?? blog.title,
      };
    },
  );

  return buildPaginatedResponse(data, total, page, limit);
}

export async function getPublishedBlogV2BySlug(slug: string) {
  await connectDB();
  await ensureBlogV2Migrated();
  return BlogV2.findOne({ slug, status: "published" });
}
