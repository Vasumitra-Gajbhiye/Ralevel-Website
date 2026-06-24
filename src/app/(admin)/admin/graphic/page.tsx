import { getAdminGraphicList } from "@/lib/data/admin/graphic";
import { parsePaginationParams } from "@/lib/pagination";
import AdminGraphicClient from "./AdminGraphicClient";

export default async function GraphicPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const { page, limit, skip } = parsePaginationParams(
    new URLSearchParams({ page: params.page ?? "1" })
  );

  const { data, pagination } = await getAdminGraphicList({ page, limit, skip });

  return <AdminGraphicClient initialMembers={data} pagination={pagination} />;
}
