import connectDB from "@/lib/mongodb";
import { buildPaginatedResponse, type PaginatedResult } from "@/lib/pagination";
import type { Role } from "@/lib/roles";
import BlogV2 from "@/models/blogV2";
import type { BlogV2Doc } from "@/lib/data/blogsV2";
import { format } from "date-fns";
import mongoose from "mongoose";

export type AdminBlogV2 = {
  _id: string;
  title: string;
  slug: string;
  updatedAt: string;
  updatedAtLabel: string;
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
};

function formatUpdatedAt(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return format(date, "dd/MM/yyyy");
}

type GetAdminBlogsV2ListParams = {
  page: number;
  limit: number;
  skip: number;
  userId: string;
  roles: Role[];
};

export async function getAdminBlogsV2List({
  page,
  limit,
  skip,
  userId,
  roles,
}: GetAdminBlogsV2ListParams): Promise<PaginatedResult<AdminBlogV2>> {
  await connectDB();

  const isAdminLike = roles.some((r) => r === "admin" || r === "owner");

  const match = isAdminLike
    ? {}
    : { ownerId: new mongoose.Types.ObjectId(userId) };

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
        updatedAt: 1,
        ownerId: 1,
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
      slug: string;
      updatedAt: Date;
      ownerId?: mongoose.Types.ObjectId;
      ownerName?: string;
      ownerEmail?: string;
    }) => ({
      _id: blog._id.toString(),
      title: blog.title,
      slug: blog.slug,
      updatedAt:
        blog.updatedAt instanceof Date
          ? blog.updatedAt.toISOString()
          : String(blog.updatedAt),
      updatedAtLabel: formatUpdatedAt(blog.updatedAt),
      ownerId: blog.ownerId?.toString(),
      ownerName: blog.ownerName,
      ownerEmail: blog.ownerEmail,
    }),
  );

  return buildPaginatedResponse(data, total, page, limit);
}

export type AdminBlogV2Detail = {
  _id: string;
  title: string;
  slug: string;
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
  content: unknown[];
  ownerId?: string;
};

export async function getAdminBlogV2BySlug(
  slug: string,
  userId: string,
  roles: Role[],
): Promise<AdminBlogV2Detail | null> {
  await connectDB();

  const isAdminLike = roles.some((r) => r === "admin" || r === "owner");

  const query = isAdminLike
    ? { slug }
    : {
        slug,
        ownerId: new mongoose.Types.ObjectId(userId),
      };

  const blog = await BlogV2.findOne(query).lean<BlogV2Doc>();
  if (!blog) return null;

  return {
    _id: blog._id.toString(),
    title: blog.title,
    slug: blog.slug,
    metadata: blog.metadata ?? {},
    content: blog.content ?? [],
    ownerId: blog.ownerId?.toString(),
  };
}
