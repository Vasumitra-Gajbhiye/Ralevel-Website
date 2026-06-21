import { cachedQuery } from "@/lib/data-cache";
import connectDB from "@/lib/mongodb";
import { buildPaginatedResponse } from "@/lib/pagination";
import BlogsData from "@/models/blogsData";

const BLOG_LIST_PROJECTION = {
  _id: 1,
  slug: 1,
  mainTitle: 1,
  description: 1,
  date: 1,
  timeToRead: 1,
  tag: 1,
  author: 1,
};

type BlogListOptions = {
  page?: number;
  limit?: number;
};

export async function getCachedBlogList(options: BlogListOptions = {}) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 50;
  const skip = (page - 1) * limit;

  return cachedQuery(
    ["blogs", "list", String(page), String(limit)],
    async () => {
      await connectDB();
      const [data, total] = await Promise.all([
        BlogsData.find({}, BLOG_LIST_PROJECTION)
          .sort({ _id: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        BlogsData.countDocuments(),
      ]);
      return { data, total, page, limit };
    },
    { revalidate: 600, tags: ["blogs"] }
  );
}

export async function getCachedBlogBySlug(slug: string) {
  return cachedQuery(
    ["blogs", "slug", slug],
    async () => {
      await connectDB();
      return BlogsData.findOne({ slug }).lean();
    },
    { revalidate: 600, tags: ["blogs", `blog:${slug}`] }
  );
}

export async function getPaginatedBlogList(options: BlogListOptions = {}) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 50;
  const result = await getCachedBlogList({ page, limit });
  return buildPaginatedResponse(result.data, result.total, page, limit);
}
