"use client";

import AuthorAvatar from "@/components/blogs-v2/AuthorAvatar";
import { ListPagination } from "@/components/ui/list-pagination";
import { resolveBlogHeroImage } from "@/lib/blogHeroImage";
import type { PublicAuthor, PublicAuthorBlog } from "@/lib/data/authors";
import type { PaginationMeta } from "@/lib/pagination";
import { MessageCircle, ThumbsUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

function AuthorProfileSidebar({ author }: { author: PublicAuthor }) {
  const followers = author.followerCount;
  const followerLabel = `${followers} ${followers === 1 ? "follower" : "followers"}`;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <AuthorAvatar
          author={author.name}
          src={author.avatar}
          useUiAvatarsFallback={false}
          className="h-24 w-24"
        />
        <h2 className="mt-4 text-xl font-bold text-black">{author.name}</h2>
        <p className="mt-1 text-sm text-neutral-500">{followerLabel}</p>
        <p className="mt-1 text-sm text-neutral-500">
          {author.blogCount}{" "}
          {author.blogCount === 1 ? "article" : "articles"}
        </p>
      </div>

      {author.bio?.trim() && (
        <p className="mt-5 text-sm leading-relaxed text-neutral-600 text-center">
          {author.bio}
        </p>
      )}

      <button
        type="button"
        className="mt-6 w-full rounded-full border border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
        onClick={() => {}}
      >
        Follow
      </button>
    </div>
  );
}

function AuthorBlogCard({ blog }: { blog: PublicAuthorBlog }) {
  const imageSrc = blog.image ? resolveBlogHeroImage(blog.image) : null;

  return (
    <article className="group border-b border-neutral-200 pb-8 last:border-b-0 last:pb-0">
      <Link href={`/blogs/v2/${blog.slug}`} className="block">
        {imageSrc && (
          <div className="mb-4 overflow-hidden rounded-xl">
            <Image
              src={imageSrc}
              alt=""
              width={800}
              height={450}
              className="aspect-[16/9] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
          {blog.tag && (
            <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
              {blog.tag}
            </span>
          )}
          {blog.dateLabel && <span>{blog.dateLabel}</span>}
        </div>

        <h3 className="mt-2 text-2xl font-bold leading-snug text-black group-hover:text-sky-700 transition-colors">
          {blog.title}
        </h3>

        {blog.description && (
          <p className="mt-2 text-base leading-relaxed text-neutral-600 line-clamp-3">
            {blog.description}
          </p>
        )}

        <div className="mt-4 flex items-center gap-4 text-sm text-neutral-500">
          <span className="inline-flex items-center gap-1.5">
            <ThumbsUp className="h-4 w-4" />
            {blog.likeCount}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4" />
            {blog.commentCount}
          </span>
        </div>
      </Link>
    </article>
  );
}

export default function AuthorClient({
  author,
  blogs,
  pagination,
}: {
  author: PublicAuthor;
  blogs: PublicAuthorBlog[];
  pagination: PaginationMeta;
}) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="mb-8">
          <Link
            href="/author"
            className="text-sm text-sky-700 hover:underline"
          >
            ← All authors
          </Link>
        </div>

        <div className="flex flex-col-reverse gap-10 lg:flex-row lg:items-start">
          <section className="min-w-0 flex-1">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
              Articles by {author.name}
            </h1>

            {blogs.length === 0 ? (
              <p className="mt-8 text-neutral-500">
                {author.name} hasn&apos;t published any articles yet.
              </p>
            ) : (
              <div className="mt-10 space-y-10">
                {blogs.map((blog) => (
                  <AuthorBlogCard key={blog._id} blog={blog} />
                ))}
              </div>
            )}

            <ListPagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(nextPage) =>
                router.push(`/author/${author.slug}?page=${nextPage}`)
              }
              className="mt-10"
            />
          </section>

          <aside className="w-full lg:w-80 shrink-0 lg:sticky lg:top-24">
            <AuthorProfileSidebar author={author} />
          </aside>
        </div>
      </div>
    </main>
  );
}
