import { getCachedBlogList } from "@/lib/data/blogs";

export default async function getBlogs() {
  return getCachedBlogList();
}
