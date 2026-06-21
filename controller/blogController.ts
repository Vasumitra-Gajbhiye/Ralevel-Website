import { getCachedBlogList } from "@/lib/data/blogs";
import { buildPaginatedResponse } from "@/lib/pagination";

type GetBlogsOptions = {
  page?: number;
  limit?: number;
};

export default async function getBlogs(options: GetBlogsOptions = {}) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 50;
  const result = await getCachedBlogList({ page, limit });
  return buildPaginatedResponse(result.data, result.total, page, limit);
}
