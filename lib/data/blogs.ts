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

export async function getCachedBlogList() {
  return getOrSet(
    buildKey("blogs", "list"),
    async () => {
      await connectDB();
      return BlogsData.find({}, BLOG_LIST_PROJECTION).lean();
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
