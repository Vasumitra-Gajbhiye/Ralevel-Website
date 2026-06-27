import BlogPostLayout from "@/app/(others)/blogs/[slug]/BlogPostLayout";
import { BlockNoteViewer } from "@/components/blogs-v2";
import { canReviewBlogs } from "@/lib/blogs-v2/access";
import { getBlogV2PreviewById } from "@/lib/data/blogsV2";
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

export default async function BlogV2PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ blogId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { blogId } = await params;
  const { token } = await searchParams;
  const session = await getAuthSession();

  let allowed = false;

  if (token) {
    await connectDB();
    if (mongoose.Types.ObjectId.isValid(blogId)) {
      const doc = await BlogV2.findById(blogId)
        .select("previewToken ownerId")
        .lean<{ previewToken?: string; ownerId?: mongoose.Types.ObjectId }>();
      if (doc?.previewToken === token) {
        allowed = true;
      }
    }
  }

  if (!allowed && session) {
    await connectDB();
    if (mongoose.Types.ObjectId.isValid(blogId)) {
      const doc = await BlogV2.findById(blogId)
        .select("ownerId")
        .lean<{ ownerId?: mongoose.Types.ObjectId }>();
      const roles = session.userData.roles;
      const isOwner = doc?.ownerId?.toString() === session.userData.id;
      const isReviewer = canReviewBlogs(roles);
      const isWriterWithAccess =
        hasWriterTeamRole(roles) &&
        (roles.some((r) => r === "admin" || r === "owner") || isOwner);
      allowed = isOwner || isReviewer || isWriterWithAccess;
    }
  }

  if (!allowed) notFound();

  const blog = await getBlogV2PreviewById(blogId, token);
  if (!blog) notFound();

  const metadata = {
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

  return (
    <div>
      <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-sm text-center py-2 px-4">
        Preview — not published
      </div>
      <BlogPostLayout metadata={metadata} showToc={false}>
        <BlockNoteViewer initialContent={blog.content} />
      </BlogPostLayout>
    </div>
  );
}

export const dynamic = "force-dynamic";
