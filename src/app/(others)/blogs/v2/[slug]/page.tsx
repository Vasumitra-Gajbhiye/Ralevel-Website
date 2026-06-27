import BlogPostLayout from "@/app/(others)/blogs/[slug]/BlogPostLayout";
import { BlockNoteViewer } from "@/components/blogs-v2";
import { toAbsoluteBlogImageUrl } from "@/lib/blogHeroImage";
import { getBlogV2CommentCount } from "@/lib/data/blogV2Comments";
import { hasUserLikedBlogV2 } from "@/lib/data/blogV2Likes";
import { getBlogV2BySlug } from "@/lib/data/blogsV2";
import { formatBlogMediumDate } from "@/lib/formatBlogDate";
import { getAuthSession } from "@/lib/getAuthSession";
import { isAdmin } from "@/lib/roles";
import { notFound } from "next/navigation";
import { Suspense } from "react";

const baseUrl = "https://ralevel.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlogV2BySlug(slug);
  if (!blog) return {};

  const metadata = blog.metadata ?? {};
  const imageUrl = metadata.image?.trim();

  return {
    title: metadata.title ?? blog.title,
    openGraph: {
      title: metadata.title ?? blog.title,
      type: "article",
      images: imageUrl
        ? [{ url: toAbsoluteBlogImageUrl(imageUrl, baseUrl), alt: metadata.title }]
        : [],
    },
    alternates: {
      canonical: `${baseUrl}/blogs/v2/${slug}`,
    },
  };
}

export default async function BlogV2Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [blog, session, commentCount] = await Promise.all([
    getBlogV2BySlug(slug),
    getAuthSession(),
    getBlogV2CommentCount(slug),
  ]);

  if (!blog) notFound();

  const liked = session
    ? await hasUserLikedBlogV2(slug, session.userData.id)
    : false;

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
    <Suspense fallback={null}>
      <BlogPostLayout
        metadata={metadata}
        showComments
        blogSlug={slug}
        initialLikeCount={blog.likeCount}
        initialLiked={liked}
        initialCommentCount={commentCount}
        currentUserName={
          session?.user.name ?? session?.user.email ?? undefined
        }
        currentUserId={session?.userData.id}
        isAdmin={session ? isAdmin(session.userData.roles) : false}
      >
        <BlockNoteViewer initialContent={blog.content} />
      </BlogPostLayout>
    </Suspense>
  );
}

export const dynamic = "force-dynamic";
