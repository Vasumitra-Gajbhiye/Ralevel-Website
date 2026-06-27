import BlogPostLayout from "@/app/(others)/blogs/[slug]/BlogPostLayout";
import { BlockNoteViewer } from "@/components/blogs-v2";
import { canReviewBlogs, isAdminLike } from "@/lib/blogs-v2/access";
import {
  getReviewEventSnapshot,
  getVersionSnapshotForPreview,
} from "@/lib/blogs-v2/history";
import { getBlogV2PreviewById } from "@/lib/data/blogsV2";
import { resolveBlogAuthorFromOwnerId } from "@/lib/data/admin/writerProfile";
import { formatBlogMediumDate } from "@/lib/formatBlogDate";
import { getAuthSession } from "@/lib/getAuthSession";
import { hasWriterTeamRole } from "@/lib/roles";
import connectDB from "@/lib/mongodb";
import BlogV2 from "@/models/blogV2";
import mongoose from "mongoose";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ blogId: string }>;
}) {
  return {
    title: "Blog preview",
    robots: { index: false, follow: false },
  };
}

async function checkSessionAccess(
  blogId: string,
  userId: string,
  roles: string[],
): Promise<boolean> {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(blogId)) return false;

  const doc = await BlogV2.findById(blogId)
    .select("ownerId")
    .lean<{ ownerId?: mongoose.Types.ObjectId }>();

  const isOwner = doc?.ownerId?.toString() === userId;
  const isReviewer = canReviewBlogs(roles as Parameters<typeof canReviewBlogs>[0]);
  const isWriterWithAccess =
    hasWriterTeamRole(roles as Parameters<typeof hasWriterTeamRole>[0]) &&
    (isAdminLike(roles as Parameters<typeof isAdminLike>[0]) || isOwner);

  return isOwner || isReviewer || isWriterWithAccess;
}

export default async function BlogV2PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ blogId: string }>;
  searchParams: Promise<{
    token?: string;
    eventId?: string;
    versionId?: string;
  }>;
}) {
  const { blogId } = await params;
  const { token, eventId, versionId } = await searchParams;
  const session = await getAuthSession();
  const isHistorical = Boolean(eventId || versionId);

  let allowed = false;

  if (isHistorical) {
    if (session) {
      allowed = await checkSessionAccess(
        blogId,
        session.userData.id,
        session.userData.roles,
      );
    }
  } else if (token) {
    await connectDB();
    if (mongoose.Types.ObjectId.isValid(blogId)) {
      const doc = await BlogV2.findById(blogId)
        .select("previewToken ownerId")
        .lean<{ previewToken?: string; ownerId?: mongoose.Types.ObjectId }>();
      if (doc?.previewToken === token) {
        allowed = true;
      }
    }
  } else if (session) {
    allowed = await checkSessionAccess(
      blogId,
      session.userData.id,
      session.userData.roles,
    );
  }

  if (!allowed) notFound();

  let title = "";
  let content: unknown[] = [];
  let metadata: {
    title?: string;
    author?: string;
    date?: string;
    tag?: string;
    image?: string;
    description?: string;
    readTimeMinutes?: number;
    authorBio?: string;
    authorFollowers?: number;
    authorAvatar?: string;
  } = {};
  let bannerLabel = "Preview — not published";

  if (eventId) {
    const snapshot = await getReviewEventSnapshot(blogId, eventId);
    if (!snapshot) notFound();
    title = snapshot.title;
    content = Array.isArray(snapshot.content) ? snapshot.content : [];
    metadata = (snapshot.metadata as typeof metadata) ?? {};
    bannerLabel = "Historical preview — submitted version";
  } else if (versionId) {
    const snapshot = await getVersionSnapshotForPreview(blogId, versionId);
    if (!snapshot) notFound();
    title = snapshot.title;
    content = Array.isArray(snapshot.content) ? snapshot.content : [];
    metadata = (snapshot.metadata as typeof metadata) ?? {};
    bannerLabel = "Historical preview — published version";
  } else {
    const blog = await getBlogV2PreviewById(blogId, token);
    if (!blog) notFound();
    title = blog.metadata?.title ?? blog.title;
    content = blog.content ?? [];
    metadata = {
      title: blog.metadata?.title ?? blog.title,
      author: blog.author?.name ?? blog.metadata?.author ?? "",
      date: blog.metadata?.date
        ? formatBlogMediumDate(blog.metadata.date)
        : "",
      tag: blog.metadata?.tag,
      image: blog.metadata?.image,
      description: blog.metadata?.description,
      readTimeMinutes: blog.metadata?.readTimeMinutes,
      authorBio: blog.author?.bio ?? blog.metadata?.authorBio,
      authorFollowers:
        blog.author?.followerCount ?? blog.metadata?.authorFollowers,
      authorAvatar: blog.author?.avatar,
    };
  }

  if (isHistorical) {
    await connectDB();
    const doc = await BlogV2.findById(blogId)
      .select("ownerId metadata")
      .lean<{
        ownerId?: mongoose.Types.ObjectId;
        metadata?: { date?: string };
      }>();
    const ownerId = doc?.ownerId?.toString();
    const author = ownerId
      ? await resolveBlogAuthorFromOwnerId(ownerId)
      : null;

    metadata = {
      ...metadata,
      title: metadata.title ?? title,
      author: author?.name ?? metadata.author ?? "",
      date: metadata.date
        ? formatBlogMediumDate(metadata.date)
        : "",
      authorBio: author?.bio ?? metadata.authorBio,
      authorFollowers: author?.followerCount ?? metadata.authorFollowers,
      authorAvatar: author?.avatar,
    };
  }

  const layoutMetadata = {
    title: metadata.title ?? title,
    author: metadata.author,
    date: metadata.date,
    tag: metadata.tag,
    image: metadata.image,
    description: metadata.description,
    readTimeMinutes: metadata.readTimeMinutes,
    authorBio: metadata.authorBio,
    authorFollowers: metadata.authorFollowers,
    authorAvatar: metadata.authorAvatar,
  };

  return (
    <div>
      <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-sm text-center py-2 px-4">
        {bannerLabel}
      </div>
      <BlogPostLayout metadata={layoutMetadata} showToc={false}>
        <BlockNoteViewer initialContent={content} />
      </BlogPostLayout>
    </div>
  );
}

export const dynamic = "force-dynamic";
