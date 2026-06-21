import { getAuthSession } from "@/lib/getAuthSession";
import { getAdminAccessList } from "@/lib/data/admin/access";
import { parsePaginationParams } from "@/lib/pagination";
import AdminAccessClient from "./AdminAccessClient";

export default async function AccessPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getAuthSession();
  const params = await searchParams;
  const { page, limit, skip } = parsePaginationParams(
    new URLSearchParams({ page: params.page ?? "1" })
  );

  const { data, pagination } = await getAdminAccessList({ page, limit, skip });

  return (
    <AdminAccessClient
      session={session}
      initialUsers={data}
      pagination={pagination}
    />
  );
}
