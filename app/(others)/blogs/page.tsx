import getBlogs from "@/controller/blogController";
import BlogsClient from "./BlogsClient";

export const revalidate = 300;

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const result = await getBlogs({ page, limit: 50 });

  return (
    <BlogsClient
      data={result.data}
      pagination={result.pagination}
    />
  );
}
