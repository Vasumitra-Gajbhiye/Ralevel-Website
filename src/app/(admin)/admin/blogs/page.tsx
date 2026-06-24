import { getAuthSession } from "@/lib/getAuthSession";
import { getAdminBlogsList } from "@/lib/data/admin/blogs";
import { parsePaginationParams } from "@/lib/pagination";
import AdminBlogsClient from "./AdminBlogsClient";

export default async function AdminBlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getAuthSession();
  const params = await searchParams;
  const { page, limit, skip } = parsePaginationParams(
    new URLSearchParams({ page: params.page ?? "1" })
  );

  const { data, pagination } = await getAdminBlogsList({
    page,
    limit,
    skip,
    userId: session!.userData.id,
    roles: session!.userData.roles,
  });

  return (
    <AdminBlogsClient
      session={session}
      initialBlogs={data}
      pagination={pagination}
    />
  );
}
