import { getPaginatedBlogList } from "@/lib/data/blogs";

type GetBlogsOptions = {
  page?: number;
  limit?: number;
};

export default async function getBlogs(options: GetBlogsOptions = {}) {
  return getPaginatedBlogList(options);
}
