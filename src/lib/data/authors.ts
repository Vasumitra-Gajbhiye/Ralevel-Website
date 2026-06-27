import { buildAuthorSlug } from "@/lib/authorSlug";
import connectDB from "@/lib/mongodb";
import {
  buildPaginatedResponse,
  type PaginatedResult,
} from "@/lib/pagination";
import { WRITER_TEAM_ROLES } from "@/lib/roles";
import BlogV2 from "@/models/blogV2";
import UserData from "@/models/userData";
import { format } from "date-fns";
import mongoose from "mongoose";

export type PublicAuthor = {
  userId: string;
  slug: string;
  name: string;
  bio?: string;
  avatar?: string;
  blogCount: number;
  followerCount: number;
};

export type PublicAuthorBlog = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  tag?: string;
  dateLabel: string;
  likeCount: number;
  commentCount: number;
};

function displayNameFromUser(user: {
  name?: string;
  email: string;
}): string {
  if (user.name?.trim()) return user.name.trim();
  const prefix = user.email.split("@")[0];
  return prefix || "Author";
}

function mapUserToPublicAuthor(
  user: {
    _id: mongoose.Types.ObjectId;
    name?: string;
    email: string;
    writerProfile?: { bio?: string; avatar?: string };
  },
  blogCount = 0,
): PublicAuthor {
  const userId = user._id.toString();
  const name = displayNameFromUser(user);

  return {
    userId,
    slug: buildAuthorSlug(name, userId),
    name,
    bio: user.writerProfile?.bio?.trim() || undefined,
    avatar: user.writerProfile?.avatar?.trim() || undefined,
    blogCount,
    followerCount: 0,
  };
}

function formatBlogDate(value?: string, updatedAt?: Date): string {
  if (value?.trim()) {
    const parsed = new Date(value.trim());
    if (!Number.isNaN(parsed.getTime())) {
      return format(parsed, "MMM d, yyyy");
    }
  }
  if (updatedAt) {
    return format(updatedAt, "MMM d, yyyy");
  }
  return "";
}

type GetPublicAuthorsParams = {
  page: number;
  limit: number;
  skip: number;
};

export async function getPublicAuthors({
  page,
  limit,
  skip,
}: GetPublicAuthorsParams): Promise<PaginatedResult<PublicAuthor>> {
  await connectDB();

  const [result] = await UserData.aggregate([
    {
      $match: {
        roles: { $in: [...WRITER_TEAM_ROLES] },
      },
    },
    {
      $lookup: {
        from: "blogv2s",
        localField: "_id",
        foreignField: "ownerId",
        as: "blogs",
      },
    },
    {
      $addFields: {
        blogCount: { $size: "$blogs" },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        writerProfile: 1,
        blogCount: 1,
      },
    },
    { $sort: { name: 1, email: 1 } },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    },
  ]);

  const total = result.metadata[0]?.total ?? 0;
  const data: PublicAuthor[] = result.data.map(
    (user: {
      _id: mongoose.Types.ObjectId;
      name?: string;
      email: string;
      writerProfile?: { bio?: string; avatar?: string };
      blogCount: number;
    }) => mapUserToPublicAuthor(user, user.blogCount ?? 0),
  );

  return buildPaginatedResponse(data, total, page, limit);
}

export async function getPublicAuthorByUserId(
  userId: string,
): Promise<PublicAuthor | null> {
  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(userId)) return null;

  const [user] = await UserData.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
        roles: { $in: [...WRITER_TEAM_ROLES] },
      },
    },
    {
      $lookup: {
        from: "blogv2s",
        localField: "_id",
        foreignField: "ownerId",
        as: "blogs",
      },
    },
    {
      $addFields: {
        blogCount: { $size: "$blogs" },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        writerProfile: 1,
        blogCount: 1,
      },
    },
  ]);

  if (!user) return null;

  return mapUserToPublicAuthor(
    user as {
      _id: mongoose.Types.ObjectId;
      name?: string;
      email: string;
      writerProfile?: { bio?: string; avatar?: string };
      blogCount: number;
    },
    user.blogCount ?? 0,
  );
}

type GetPublicAuthorBlogsParams = {
  ownerId: string;
  page: number;
  limit: number;
  skip: number;
};

export async function getPublicAuthorBlogs({
  ownerId,
  page,
  limit,
  skip,
}: GetPublicAuthorBlogsParams): Promise<PaginatedResult<PublicAuthorBlog>> {
  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(ownerId)) {
    return buildPaginatedResponse([], 0, page, limit);
  }

  const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

  const [result] = await BlogV2.aggregate([
    { $match: { ownerId: ownerObjectId } },
    { $sort: { updatedAt: -1 } },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              title: 1,
              slug: 1,
              metadata: 1,
              likeCount: 1,
              commentCount: 1,
              updatedAt: 1,
            },
          },
        ],
      },
    },
  ]);

  const total = result.metadata[0]?.total ?? 0;
  const data: PublicAuthorBlog[] = result.data.map(
    (blog: {
      _id: mongoose.Types.ObjectId;
      title: string;
      slug: string;
      metadata?: {
        description?: string;
        image?: string;
        tag?: string;
        date?: string;
      };
      likeCount?: number;
      commentCount?: number;
      updatedAt?: Date;
    }) => ({
      _id: blog._id.toString(),
      title: blog.title,
      slug: blog.slug,
      description: blog.metadata?.description?.trim() || undefined,
      image: blog.metadata?.image?.trim() || undefined,
      tag: blog.metadata?.tag?.trim() || undefined,
      dateLabel: formatBlogDate(blog.metadata?.date, blog.updatedAt),
      likeCount: blog.likeCount ?? 0,
      commentCount: blog.commentCount ?? 0,
    }),
  );

  return buildPaginatedResponse(data, total, page, limit);
}
