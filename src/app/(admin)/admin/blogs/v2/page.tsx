import { getAuthSession } from "@/lib/getAuthSession";
import { getAdminBlogsV2List } from "@/lib/data/admin/blogsV2";
import {
  getAdminBlogsForOwner,
  getAdminWritersOverview,
  getWriterProfile,
  isAdminLike,
} from "@/lib/data/admin/writerProfile";
import BlogsClient from "./BlogsClient";

const WRITER_BLOG_PAGE_SIZE = 12;
const ADMIN_WRITER_PAGE_SIZE = 5;
const ADMIN_BLOGS_PER_AUTHOR = 6;

function parsePage(raw?: string): number {
  const page = parseInt(raw ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default async function BlogsV2Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; ownerId?: string }>;
}) {
  const session = await getAuthSession();
  const params = await searchParams;
  const page = parsePage(params.page);

  const roles = session!.userData.roles;
  const userId = session!.userData.id;
  const admin = isAdminLike(roles);
  const ownerId = params.ownerId?.trim();

  if (admin && ownerId) {
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
      <BlogsClient
        session={session}
        mode="admin-drilldown"
        profile={profile}
        blogs={blogsResult.data}
        pagination={blogsResult.pagination}
        ownerId={ownerId}
      />
    );
  }

  if (admin) {
    const skip = (page - 1) * ADMIN_WRITER_PAGE_SIZE;
    const overview = await getAdminWritersOverview({
      page,
      limit: ADMIN_WRITER_PAGE_SIZE,
      skip,
      blogsPerAuthor: ADMIN_BLOGS_PER_AUTHOR,
    });

    return (
      <BlogsClient
        session={session}
        mode="admin-overview"
        writers={overview.data}
        pagination={overview.pagination}
      />
    );
  }

  const skip = (page - 1) * WRITER_BLOG_PAGE_SIZE;
  const [profile, blogsResult] = await Promise.all([
    getWriterProfile(userId),
    getAdminBlogsV2List({
      page,
      limit: WRITER_BLOG_PAGE_SIZE,
      skip,
      userId,
      roles,
    }),
  ]);

  return (
    <BlogsClient
      session={session}
      mode="writer"
      profile={profile}
      blogs={blogsResult.data}
      pagination={blogsResult.pagination}
    />
  );
}
