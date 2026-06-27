import connectDB from "@/lib/mongodb";
import BlogV2 from "@/models/blogV2";
import mongoose from "mongoose";

export type BlogV2Doc = {
  _id: mongoose.Types.ObjectId;
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
  content?: unknown[];
  ownerId?: mongoose.Types.ObjectId;
  likeCount?: number;
  updatedAt?: Date;
};

export type BlogV2Public = {
  _id: string;
  title: string;
  slug: string;
  metadata: {
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
  likeCount: number;
  updatedAt: string;
};

export async function getBlogV2BySlug(slug: string): Promise<BlogV2Public | null> {
  await connectDB();

  const blog = await BlogV2.findOne({ slug }).lean<BlogV2Doc>();
  if (!blog) return null;

  return {
    _id: blog._id.toString(),
    title: blog.title,
    slug: blog.slug,
    metadata: blog.metadata ?? {},
    content: blog.content ?? [],
    likeCount: blog.likeCount ?? 0,
    updatedAt:
      blog.updatedAt instanceof Date
        ? blog.updatedAt.toISOString()
        : String(blog.updatedAt),
  };
}
