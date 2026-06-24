import { getAdminResourceSubjectsList } from "@/lib/data/admin/resource-cms";
import { parsePaginationParams } from "@/lib/pagination";
import ResourceCMSClient from "./ResourceCMSClient";

export default async function ResourceCMSPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const { page, limit, skip } = parsePaginationParams(
    new URLSearchParams({ page: params.page ?? "1" })
  );

  const { data, pagination } = await getAdminResourceSubjectsList({
    page,
    limit,
    skip,
  });

  return (
    <ResourceCMSClient initialSubjects={data} pagination={pagination} />
  );
}
