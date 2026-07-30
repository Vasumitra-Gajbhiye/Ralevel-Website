import { getAuthSession } from "@/lib/getAuthSession";
import { getAdminBlogsV2List } from "@/lib/data/admin/blogsV2";
import { getWriterProfile } from "@/lib/data/admin/writerProfile";
import { needsWriterRoleSelfGrant } from "@/lib/roles";
import BlogsClient from "./BlogsClient";

const WRITER_BLOG_PAGE_SIZE = 12;

function parsePage(raw?: string): number {
  const page = parseInt(raw ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default async function BlogsV2Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getAuthSession();
  const params = await searchParams;
  const page = parsePage(params.page);
  const userId = session!.userData.id;
  const roles = session!.userData.roles;
  const needsWriterRole = needsWriterRoleSelfGrant(roles);

  if (needsWriterRole) {
    return <BlogsClient session={session} needsWriterRole />;
  }

  const skip = (page - 1) * WRITER_BLOG_PAGE_SIZE;
  const [profile, blogsResult] = await Promise.all([
    getWriterProfile(userId),
    getAdminBlogsV2List({
      page,
      limit: WRITER_BLOG_PAGE_SIZE,
      skip,
      userId,
    }),
  ]);

  return (
    <BlogsClient
      session={session}
      profile={profile}
      blogs={blogsResult.data}
      pagination={blogsResult.pagination}
    />
  );
}
