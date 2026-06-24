import { getAdminSchedulingList } from "@/lib/data/admin/scheduling";
import { parsePaginationParams } from "@/lib/pagination";
import AdminSchedulingClient from "./AdminSchedulingClient";

export default async function SchedulingPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const { page, limit, skip } = parsePaginationParams(
    new URLSearchParams({ page: params.page ?? "1" })
  );

  const { data, pagination } = await getAdminSchedulingList({
    page,
    limit,
    skip,
  });

  return <AdminSchedulingClient initialItems={data} pagination={pagination} />;
}
