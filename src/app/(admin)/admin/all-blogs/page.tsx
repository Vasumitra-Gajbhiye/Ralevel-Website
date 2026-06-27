import { getAuthSession } from "@/lib/getAuthSession";
import { getPendingBlogReviews } from "@/lib/data/admin/blogsV2";
import {
  getAdminBlogsForOwner,
  getAdminWritersOverview,
  getWriterProfile,
} from "@/lib/data/admin/writerProfile";
import AllBlogsClient from "./AllBlogsClient";
import { Suspense } from "react";

const WRITER_BLOG_PAGE_SIZE = 12;
const ADMIN_WRITER_PAGE_SIZE = 5;
const ADMIN_BLOGS_PER_AUTHOR = 6;
const PENDING_PAGE_SIZE = 10;

function parsePage(raw?: string): number {
  const page = parseInt(raw ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default async function AllBlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; ownerId?: string; tab?: string }>;
}) {
  const session = await getAuthSession();
  const params = await searchParams;
  const page = parsePage(params.page);
  const ownerId = params.ownerId?.trim();
  const isPendingTab = params.tab === "pending";
  const pendingPage = isPendingTab ? page : 1;
  const pendingSkip = (pendingPage - 1) * PENDING_PAGE_SIZE;

  const pendingResultPromise = getPendingBlogReviews({
    page: pendingPage,
    limit: PENDING_PAGE_SIZE,
    skip: pendingSkip,
  });

  if (ownerId) {
    const skip = (page - 1) * WRITER_BLOG_PAGE_SIZE;
    const [profile, blogsResult, pendingResult] = await Promise.all([
      getWriterProfile(ownerId),
      getAdminBlogsForOwner({
        ownerId,
        page,
        limit: WRITER_BLOG_PAGE_SIZE,
        skip,
      }),
      pendingResultPromise,
    ]);

    return (
      <Suspense fallback={<div className="p-8">Loading…</div>}>
        <AllBlogsClient
          session={session}
          mode="admin-drilldown"
          profile={profile}
          blogs={blogsResult.data}
          pagination={blogsResult.pagination}
          ownerId={ownerId}
          pendingBlogs={pendingResult.data}
          pendingPagination={pendingResult.pagination}
        />
      </Suspense>
    );
  }

  const skip = (page - 1) * ADMIN_WRITER_PAGE_SIZE;
  const [overview, pendingResult] = await Promise.all([
    getAdminWritersOverview({
      page,
      limit: ADMIN_WRITER_PAGE_SIZE,
      skip,
      blogsPerAuthor: ADMIN_BLOGS_PER_AUTHOR,
    }),
    pendingResultPromise,
  ]);

  return (
    <Suspense fallback={<div className="p-8">Loading…</div>}>
      <AllBlogsClient
        session={session}
        mode="admin-overview"
        writers={overview.data}
        pagination={overview.pagination}
        pendingBlogs={pendingResult.data}
        pendingPagination={pendingResult.pagination}
      />
    </Suspense>
  );
}
