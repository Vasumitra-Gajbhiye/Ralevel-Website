import connectDB from "@/lib/mongodb";
import {
  resolveBlogAuthorFromOwnerId,
  type ResolvedBlogAuthor,
} from "@/lib/data/admin/writerProfile";
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
  author: ResolvedBlogAuthor | null;
  content: unknown[];
  likeCount: number;
  updatedAt: string;
};

function applyResolvedAuthorToMetadata(
  metadata: BlogV2Public["metadata"],
  author: ResolvedBlogAuthor | null,
): BlogV2Public["metadata"] {
  if (!author) return metadata;

  return {
    ...metadata,
    author: author.name,
    authorBio: author.bio,
    authorFollowers: author.followerCount,
  };
}

export async function getBlogV2BySlug(slug: string): Promise<BlogV2Public | null> {
  await connectDB();

  const blog = await BlogV2.findOne({ slug }).lean<BlogV2Doc>();
  if (!blog) return null;

  const ownerId = blog.ownerId?.toString();
  const author = ownerId ? await resolveBlogAuthorFromOwnerId(ownerId) : null;
  const metadata = applyResolvedAuthorToMetadata(blog.metadata ?? {}, author);

  return {
    _id: blog._id.toString(),
    title: blog.title,
    slug: blog.slug,
    metadata,
    author,
    content: blog.content ?? [],
    likeCount: blog.likeCount ?? 0,
    updatedAt:
      blog.updatedAt instanceof Date
        ? blog.updatedAt.toISOString()
        : String(blog.updatedAt),
  };
}
