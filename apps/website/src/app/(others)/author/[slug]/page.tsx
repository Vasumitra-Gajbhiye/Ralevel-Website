import AuthorClient from "./AuthorClient";
import { parseAuthorUserIdFromSlug } from "@/lib/authorSlug";
import {
  getPublicAuthorBlogs,
  getPublicAuthorByUserId,
} from "@/lib/data/authors";
import { parsePaginationParams } from "@/lib/pagination";
import { notFound } from "next/navigation";

const AUTHOR_BLOGS_PAGE_SIZE = 10;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const userId = parseAuthorUserIdFromSlug(slug);
  if (!userId) return { title: "Author not found" };

  const author = await getPublicAuthorByUserId(userId);
  if (!author) return { title: "Author not found" };

  return {
    title: `${author.name} | r/alevel Authors`,
    description:
      author.bio ??
      `Read articles by ${author.name} on r/alevel.`,
  };
}

export default async function AuthorPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const userId = parseAuthorUserIdFromSlug(slug);
  if (!userId) notFound();

  const author = await getPublicAuthorByUserId(userId);
  if (!author || author.slug !== slug) notFound();

  const { page, limit, skip } = parsePaginationParams(
    new URLSearchParams({
      page: query.page ?? "1",
      limit: String(AUTHOR_BLOGS_PAGE_SIZE),
    }),
  );

  const { data: blogs, pagination } = await getPublicAuthorBlogs({
    ownerId: author.userId,
    page,
    limit,
    skip,
  });

  return (
    <AuthorClient author={author} blogs={blogs} pagination={pagination} />
  );
}

export const dynamic = "force-dynamic";
