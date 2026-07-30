"use client";

import AuthorAvatar from "@/components/blogs-v2/AuthorAvatar";
import { Button } from "@/components/ui/button";
import { ListPagination } from "@/components/ui/list-pagination";
import type { PublicAuthor } from "@/lib/data/authors";
import type { PaginationMeta } from "@/lib/pagination";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthorListClient({
  authors,
  pagination,
}: {
  authors: PublicAuthor[];
  pagination: PaginationMeta;
}) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-gradient-to-b from-[#eaf5ff] via-[#f9fbff] to-white">
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-sky-800">
            Authors
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto text-base md:text-lg">
            Meet the writers behind r/alevel&apos;s articles and guides.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 md:px-10 pb-20">
        {authors.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-500">
            No authors found yet.
          </div>
        ) : (
          <div className="rounded-xl border bg-white overflow-hidden">
            <div className="hidden sm:grid sm:grid-cols-[minmax(0,1fr)_100px_100px] gap-4 px-5 py-3 bg-gray-50 text-sm font-medium text-gray-600">
              <div>Author</div>
              <div className="text-center">Articles</div>
              <div className="text-right">Profile</div>
            </div>

            <div className="divide-y">
              {authors.map((author) => (
                <div
                  key={author.userId}
                  className="flex flex-col gap-4 px-5 py-5 sm:grid sm:grid-cols-[minmax(0,1fr)_100px_100px] sm:items-center sm:gap-4"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <AuthorAvatar
                      author={author.name}
                      src={author.avatar}
                      className="h-12 w-12"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {author.name}
                      </p>
                      {author.bio ? (
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                          {author.bio}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-gray-400">
                          r/alevel writer
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 sm:text-center">
                    <span className="sm:hidden font-medium text-gray-500">
                      Articles:{" "}
                    </span>
                    {author.blogCount}
                  </div>

                  <div className="sm:text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/author/${author.slug}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <ListPagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(nextPage) =>
            router.push(`/author?page=${nextPage}`)
          }
          className="mt-6"
        />
      </section>
    </main>
  );
}
