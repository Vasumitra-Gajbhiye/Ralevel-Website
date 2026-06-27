import { getAuthSession } from "@/lib/getAuthSession";
import {
  getAdminBlogsForOwner,
  getAdminWritersOverview,
  getWriterProfile,
} from "@/lib/data/admin/writerProfile";
import AllBlogsClient from "./AllBlogsClient";

const WRITER_BLOG_PAGE_SIZE = 12;
const ADMIN_WRITER_PAGE_SIZE = 5;
const ADMIN_BLOGS_PER_AUTHOR = 6;

function parsePage(raw?: string): number {
  const page = parseInt(raw ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default async function AllBlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; ownerId?: string }>;
}) {
  const session = await getAuthSession();
  const params = await searchParams;
  const page = parsePage(params.page);
  const ownerId = params.ownerId?.trim();

  if (ownerId) {
    const skip = (page - 1) * WRITER_BLOG_PAGE_SIZE;
    const [profile, blogsResult] = await Promise.all([
      getWriterProfile(ownerId),
      getAdminBlogsForOwner({
        ownerId,
        page,
        limit: WRITER_BLOG_PAGE_SIZE,
        skip,
      }),
    ]);

    return (
      <AllBlogsClient
        session={session}
        mode="admin-drilldown"
        profile={profile}
        blogs={blogsResult.data}
        pagination={blogsResult.pagination}
        ownerId={ownerId}
      />
    );
  }

  const skip = (page - 1) * ADMIN_WRITER_PAGE_SIZE;
  const overview = await getAdminWritersOverview({
    page,
    limit: ADMIN_WRITER_PAGE_SIZE,
    skip,
    blogsPerAuthor: ADMIN_BLOGS_PER_AUTHOR,
  });

  return (
    <AllBlogsClient
      session={session}
      mode="admin-overview"
      writers={overview.data}
      pagination={overview.pagination}
    />
  );
}
