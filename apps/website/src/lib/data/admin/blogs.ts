import connectDB from "@/lib/mongodb";
import { buildPaginatedResponse, type PaginatedResult } from "@/lib/pagination";
import type { Role } from "@/lib/roles";
import EditorBlog from "@/models/editorBlogs";
import mongoose from "mongoose";

export type AdminBlog = {
  _id: string;
  title: string;
  slug: string;
  updatedAt: string;
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
};

type GetAdminBlogsListParams = {
  page: number;
  limit: number;
  skip: number;
  userId: string;
  roles: Role[];
};

export async function getAdminBlogsList({
  page,
  limit,
  skip,
  userId,
  roles,
}: GetAdminBlogsListParams): Promise<PaginatedResult<AdminBlog>> {
  await connectDB();

  const isAdminLike = roles.some((r) => r === "admin" || r === "owner");

  const match = isAdminLike
    ? {}
    : { ownerId: new mongoose.Types.ObjectId(userId) };

  const [result] = await EditorBlog.aggregate([
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
  const data: AdminBlog[] = result.data.map(
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
      ownerId: blog.ownerId?.toString(),
      ownerName: blog.ownerName,
      ownerEmail: blog.ownerEmail,
    }),
  );

  return buildPaginatedResponse(data, total, page, limit);
}
