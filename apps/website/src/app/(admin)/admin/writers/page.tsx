import { getWriterAccessList } from "@/lib/data/admin/writer-access";
import { getAuthSession } from "@/lib/getAuthSession";
import { parsePaginationParams } from "@/lib/pagination";
import WriterAccessClient from "./WriterAccessClient";

export default async function WritersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getAuthSession();
  const params = await searchParams;
  const { page, limit, skip } = parsePaginationParams(
    new URLSearchParams({ page: params.page ?? "1" }),
  );

  const { data, pagination } = await getWriterAccessList({
    page,
    limit,
    skip,
  });

  return (
    <WriterAccessClient
      session={session}
      initialUsers={data}
      pagination={pagination}
    />
  );
}
