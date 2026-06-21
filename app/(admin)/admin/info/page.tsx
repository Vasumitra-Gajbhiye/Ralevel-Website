import { getAdminInfoList } from "@/lib/data/admin/info";
import { parsePaginationParams } from "@/lib/pagination";
import AdminInfoClient from "./AdminInfoClient";

export default async function InfoPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const { page, limit, skip } = parsePaginationParams(
    new URLSearchParams({ page: params.page ?? "1" })
  );

  const { data, pagination } = await getAdminInfoList({ page, limit, skip });

  return <AdminInfoClient initialMembers={data} pagination={pagination} />;
}
