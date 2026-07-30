import { getPublicAuthors } from "@/lib/data/authors";
import { parsePaginationParams } from "@/lib/pagination";
import AuthorListClient from "./AuthorListClient";

const AUTHORS_PAGE_SIZE = 20;

export default async function AuthorListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const { page, limit, skip } = parsePaginationParams(
    new URLSearchParams({
      page: params.page ?? "1",
      limit: String(AUTHORS_PAGE_SIZE),
    }),
  );

  const { data, pagination } = await getPublicAuthors({ page, limit, skip });

  return <AuthorListClient authors={data} pagination={pagination} />;
}

export const dynamic = "force-dynamic";
