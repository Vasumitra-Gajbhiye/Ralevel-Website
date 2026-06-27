import { buildAuthorSlug } from "@/lib/authorSlug";
import { resolveBlogAuthorFromOwnerId } from "@/lib/data/admin/writerProfile";
import { ensureBlogV2Migrated } from "@/lib/blogs-v2/migrate";
import connectDB from "@/lib/mongodb";
import BlogV2 from "@/models/blogV2";
import { format } from "date-fns";
import mongoose from "mongoose";

export type BlogRecommendationItem = {
  slug: string;
  title: string;
  description?: string;
  image?: string;
  authorName: string;
  dateLabel: string;
  likeCount: number;
  commentCount: number;
};

export type BlogRecommendations = {
  authorItems: BlogRecommendationItem[];
  siteItems: BlogRecommendationItem[];
  authorSlug?: string;
  authorName: string;
};

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

function mapBlogToRecommendation(
  blog: {
    slug: string;
    title: string;
    metadata?: {
      title?: string;
      description?: string;
      image?: string;
      date?: string;
      author?: string;
    };
    likeCount?: number;
    commentCount?: number;
    updatedAt?: Date;
    ownerName?: string;
  },
): BlogRecommendationItem {
  return {
    slug: blog.slug,
    title: blog.metadata?.title?.trim() || blog.title,
    description: blog.metadata?.description?.trim() || undefined,
    image: blog.metadata?.image?.trim() || undefined,
    authorName: blog.ownerName ?? blog.metadata?.author?.trim() ?? "Author",
    dateLabel: formatBlogDate(blog.metadata?.date, blog.updatedAt),
    likeCount: blog.likeCount ?? 0,
    commentCount: blog.commentCount ?? 0,
  };
}

export async function getMoreFromAuthor({
  ownerId,
  excludeSlug,
  limit = 4,
}: {
  ownerId: string;
  excludeSlug: string;
  limit?: number;
}): Promise<BlogRecommendationItem[]> {
  await connectDB();
  await ensureBlogV2Migrated();

  if (!mongoose.Types.ObjectId.isValid(ownerId)) return [];

  const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

  const blogs = await BlogV2.find({
    ownerId: ownerObjectId,
    status: "published",
    slug: { $ne: excludeSlug },
  })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select("title slug metadata likeCount commentCount updatedAt")
    .lean<
      {
        title: string;
        slug: string;
        metadata?: {
          title?: string;
          description?: string;
          image?: string;
          date?: string;
        };
        likeCount?: number;
        commentCount?: number;
        updatedAt?: Date;
      }[]
    >();

  const author = await resolveBlogAuthorFromOwnerId(ownerId);
  const authorName = author?.name ?? "Author";

  return blogs.map((blog) =>
    mapBlogToRecommendation({ ...blog, ownerName: authorName }),
  );
}

export async function getMoreFromRalevel({
  excludeSlug,
  limit = 6,
}: {
  excludeSlug: string;
  limit?: number;
}): Promise<BlogRecommendationItem[]> {
  await connectDB();
  await ensureBlogV2Migrated();

  const blogs = await BlogV2.aggregate([
    { $match: { status: "published", slug: { $ne: excludeSlug } } },
    { $sort: { updatedAt: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "userdatas",
        localField: "ownerId",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $project: {
        title: 1,
        slug: 1,
        metadata: 1,
        likeCount: 1,
        commentCount: 1,
        updatedAt: 1,
        ownerName: { $arrayElemAt: ["$owner.name", 0] },
        ownerEmail: { $arrayElemAt: ["$owner.email", 0] },
      },
    },
  ]);

  return blogs.map(
    (blog: {
      slug: string;
      title: string;
      metadata?: {
        title?: string;
        description?: string;
        image?: string;
        date?: string;
        author?: string;
      };
      likeCount?: number;
      commentCount?: number;
      updatedAt?: Date;
      ownerName?: string;
      ownerEmail?: string;
    }) => {
      const ownerName =
        blog.ownerName?.trim() ||
        blog.ownerEmail?.split("@")[0] ||
        blog.metadata?.author?.trim() ||
        "Author";
      return mapBlogToRecommendation({ ...blog, ownerName });
    },
  );
}

export async function getBlogV2Recommendations({
  ownerId,
  excludeSlug,
  authorName,
}: {
  ownerId?: string | null;
  excludeSlug: string;
  authorName: string;
}): Promise<BlogRecommendations> {
  const [authorItems, siteItems] = await Promise.all([
    ownerId
      ? getMoreFromAuthor({ ownerId, excludeSlug, limit: 4 })
      : Promise.resolve([]),
    getMoreFromRalevel({ excludeSlug, limit: 6 }),
  ]);

  const authorSlug =
    ownerId && authorName.trim()
      ? buildAuthorSlug(authorName.trim(), ownerId)
      : undefined;

  return {
    authorItems,
    siteItems,
    authorSlug,
    authorName: authorName.trim() || "Author",
  };
}
