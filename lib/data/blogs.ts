import { buildKey, getOrSet } from "@/lib/cache";
import connectDB from "@/lib/mongodb";
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

  return getOrSet(
    buildKey("blogs", "list", String(page), String(limit)),
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
    { ttlSec: 600, tags: ["blogs"] }
  );
}

export async function getCachedBlogBySlug(slug: string) {
  return getOrSet(
    buildKey("blogs", "slug", slug),
    async () => {
      await connectDB();
      return BlogsData.findOne({ slug }).lean();
    },
    { ttlSec: 600, tags: ["blogs", `blog:${slug}`] }
  );
}
