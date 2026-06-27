import { getPreviewContent } from "@/lib/blogs-v2/content";
import { ensureBlogV2Migrated } from "@/lib/blogs-v2/migrate";
import connectDB from "@/lib/mongodb";
import {
  resolveBlogAuthorFromOwnerId,
  type ResolvedBlogAuthor,
} from "@/lib/data/admin/writerProfile";
import BlogV2 from "@/models/blogV2";
import type { BlogV2Status } from "@/types/blogV2";
import mongoose from "mongoose";

export type BlogV2Doc = {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug?: string | null;
  status?: BlogV2Status;
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
  previewToken?: string;
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
  await ensureBlogV2Migrated();

  const blog = await BlogV2.findOne({ slug, status: "published" }).lean<BlogV2Doc>();
  if (!blog || !blog.slug) return null;

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

export async function getBlogV2PreviewById(
  blogId: string,
  token?: string,
): Promise<(BlogV2Public & { isPreview: true }) | null> {
  await connectDB();
  await ensureBlogV2Migrated();

  if (!mongoose.Types.ObjectId.isValid(blogId)) return null;

  const blog = await BlogV2.findById(blogId).lean<BlogV2Doc & {
    draft?: { title: string; metadata?: BlogV2Doc["metadata"]; content?: unknown[] };
  }>();

  if (!blog) return null;

  if (token && blog.previewToken !== token) {
    return null;
  }

  const preview = getPreviewContent(blog as Parameters<typeof getPreviewContent>[0]);

  const ownerId = blog.ownerId?.toString();
  const author = ownerId ? await resolveBlogAuthorFromOwnerId(ownerId) : null;
  const metadata = applyResolvedAuthorToMetadata(preview.metadata ?? {}, author);

  return {
    _id: blog._id.toString(),
    title: preview.title,
    slug: blog.slug ?? blog._id.toString(),
    metadata,
    author,
    content: preview.content ?? [],
    likeCount: blog.likeCount ?? 0,
    updatedAt:
      blog.updatedAt instanceof Date
        ? blog.updatedAt.toISOString()
        : String(blog.updatedAt),
    isPreview: true,
  };
}
