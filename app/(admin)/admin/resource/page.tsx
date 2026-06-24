import { getResourceAccessList } from "@/lib/data/admin/resource-access";
import { getAuthSession } from "@/lib/getAuthSession";
import { parsePaginationParams } from "@/lib/pagination";
import ResourceAccessClient from "./ResourceAccessClient";

export default async function ResourcePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getAuthSession();
  const params = await searchParams;
  const { page, limit, skip } = parsePaginationParams(
    new URLSearchParams({ page: params.page ?? "1" })
  );

  const { data, pagination } = await getResourceAccessList({
    page,
    limit,
    skip,
  });

  return (
    <ResourceAccessClient
      session={session}
      initialUsers={data}
      pagination={pagination}
    />
  );
}
