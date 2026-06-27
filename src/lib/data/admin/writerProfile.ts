import connectDB from "@/lib/mongodb";
import { buildPaginatedResponse, type PaginatedResult } from "@/lib/pagination";
import {
  ROLES,
  WRITER_TEAM_ROLES,
  type Role,
} from "@/lib/roles";
import type { AdminBlogV2 } from "@/lib/data/admin/blogsV2";
import BlogV2 from "@/models/blogV2";
import UserData from "@/models/userData";
import type { BlogV2ReviewType, BlogV2Status } from "@/types/blogV2";
import { format } from "date-fns";
import mongoose from "mongoose";

export type WriterProfile = {
  userId: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  followerCount: number;
};

export type WriterOverviewBlog = {
  _id: string;
  title: string;
  slug?: string | null;
  status: BlogV2Status;
  updatedAtLabel: string;
};

export type WriterOverviewEntry = WriterProfile & {
  recentBlogs: WriterOverviewBlog[];
  totalBlogCount: number;
};

function formatUpdatedAt(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return format(date, "dd/MM/yyyy");
}

function displayNameFromUser(user: {
  name?: string;
  email: string;
}): string {
  if (user.name?.trim()) return user.name.trim();
  const prefix = user.email.split("@")[0];
  return prefix || "Writer";
}

function mapUserToProfile(user: {
  _id: mongoose.Types.ObjectId;
  name?: string;
  email: string;
  writerProfile?: { bio?: string; avatar?: string };
}): WriterProfile {
  return {
    userId: user._id.toString(),
    name: displayNameFromUser(user),
    email: user.email,
    bio: user.writerProfile?.bio?.trim() || undefined,
    avatar: user.writerProfile?.avatar?.trim() || undefined,
    followerCount: 0,
  };
}

function buildRoleRankSwitch() {
  return {
    $switch: {
      branches: ROLES.map((role, index) => ({
        case: { $in: [role, "$roles"] },
        then: index,
      })),
      default: ROLES.length,
    },
  };
}

export type ResolvedBlogAuthor = {
  name: string;
  bio?: string;
  avatar?: string;
  followerCount: number;
};

export function mapWriterProfileToBlogAuthor(
  profile: WriterProfile,
): ResolvedBlogAuthor {
  return {
    name: profile.name,
    bio: profile.bio,
    avatar: profile.avatar,
    followerCount: profile.followerCount,
  };
}

export async function resolveBlogAuthorFromOwnerId(
  ownerId: string,
): Promise<ResolvedBlogAuthor | null> {
  const profile = await getWriterProfile(ownerId);
  if (!profile) return null;
  return mapWriterProfileToBlogAuthor(profile);
}

export async function getWriterProfile(
  userId: string,
): Promise<WriterProfile | null> {
  await connectDB();

  const user = await UserData.findById(userId)
    .select("name email writerProfile")
    .lean();

  if (!user) return null;

  return mapUserToProfile(
    user as unknown as {
      _id: mongoose.Types.ObjectId;
      name?: string;
      email: string;
      writerProfile?: { bio?: string; avatar?: string };
    },
  );
}

export type UpdateWriterProfileInput = {
  name?: string;
  bio?: string;
  avatar?: string;
};

export async function updateWriterProfile(
  userId: string,
  input: UpdateWriterProfileInput,
): Promise<WriterProfile | null> {
  await connectDB();

  const update: Record<string, unknown> = {};

  if (input.name !== undefined) {
    update.name = input.name.trim();
  }
  if (input.bio !== undefined) {
    update["writerProfile.bio"] = input.bio.trim();
  }
  if (input.avatar !== undefined) {
    update["writerProfile.avatar"] = input.avatar.trim();
  }

  if (Object.keys(update).length === 0) {
    return getWriterProfile(userId);
  }

  const user = await UserData.findByIdAndUpdate(
    userId,
    { $set: update },
    { new: true },
  )
    .select("name email writerProfile")
    .lean();

  if (!user) return null;

  return mapUserToProfile(
    user as unknown as {
      _id: mongoose.Types.ObjectId;
      name?: string;
      email: string;
      writerProfile?: { bio?: string; avatar?: string };
    },
  );
}

type GetAdminWritersOverviewParams = {
  page: number;
  limit: number;
  skip: number;
  blogsPerAuthor: number;
};

export async function getAdminWritersOverview({
  page,
  limit,
  skip,
  blogsPerAuthor,
}: GetAdminWritersOverviewParams): Promise<PaginatedResult<WriterOverviewEntry>> {
  await connectDB();

  const blogCollection = BlogV2.collection.collectionName;

  const [result] = await UserData.aggregate([
    {
      $match: {
        roles: { $in: [...WRITER_TEAM_ROLES] },
      },
    },
    {
      $lookup: {
        from: blogCollection,
        let: { userId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$ownerId", "$$userId"] } } },
          { $sort: { updatedAt: -1 } },
        ],
        as: "allBlogs",
      },
    },
    {
      $addFields: {
        totalBlogCount: { $size: "$allBlogs" },
        recentBlogs: { $slice: ["$allBlogs", blogsPerAuthor] },
        roleRank: buildRoleRankSwitch(),
      },
    },
    {
      $sort: {
        roleRank: 1,
        name: 1,
        email: 1,
      },
    },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              name: 1,
              email: 1,
              writerProfile: 1,
              recentBlogs: {
                _id: 1,
                title: 1,
                slug: 1,
                status: 1,
                updatedAt: 1,
              },
              totalBlogCount: 1,
            },
          },
        ],
      },
    },
  ]);

  const total = result.metadata[0]?.total ?? 0;
  const data: WriterOverviewEntry[] = result.data.map(
    (user: {
      _id: mongoose.Types.ObjectId;
      name?: string;
      email: string;
      writerProfile?: { bio?: string; avatar?: string };
      recentBlogs: Array<{
        _id: mongoose.Types.ObjectId;
        title: string;
        slug?: string | null;
        status?: BlogV2Status;
        updatedAt: Date;
      }>;
      totalBlogCount: number;
    }) => ({
      ...mapUserToProfile(user),
      recentBlogs: user.recentBlogs.map((blog) => ({
        _id: blog._id.toString(),
        title: blog.title,
        slug: blog.slug ?? null,
        status: blog.status ?? "draft",
        updatedAtLabel: formatUpdatedAt(blog.updatedAt),
      })),
      totalBlogCount: user.totalBlogCount ?? 0,
    }),
  );

  return buildPaginatedResponse(data, total, page, limit);
}

type GetAdminBlogsForOwnerParams = {
  ownerId: string;
  page: number;
  limit: number;
  skip: number;
};

export async function getAdminBlogsForOwner({
  ownerId,
  page,
  limit,
  skip,
}: GetAdminBlogsForOwnerParams): Promise<PaginatedResult<AdminBlogV2>> {
  await connectDB();

  const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

  const [result] = await BlogV2.aggregate([
    { $match: { ownerId: ownerObjectId } },
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
  const data: AdminBlogV2[] = result.data.map(
    (blog: {
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
    }) => ({
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
    }),
  );

  return buildPaginatedResponse(data, total, page, limit);
}

export function isAdminLike(roles: Role[]): boolean {
  return roles.some((r) => r === "admin" || r === "owner");
}
