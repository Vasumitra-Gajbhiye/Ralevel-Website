"use client";

import type { AdminBlogV2 } from "@/lib/data/admin/blogsV2";
import type { AuthSession } from "@/types/auth";
import Link from "next/link";
import { FiTrash2 } from "react-icons/fi";

type BlogV2AdminGridProps = {
  blogs: AdminBlogV2[];
  emptyMessage: string;
  session: AuthSession | null;
  deletingSlug: string | null;
  onDelete: (slug: string) => void;
  deleteConfirmMessage?: string;
};

export default function BlogV2AdminGrid({
  blogs,
  emptyMessage,
  session,
  deletingSlug,
  onDelete,
  deleteConfirmMessage = "Delete this blog permanently?",
}: BlogV2AdminGridProps) {
  const isAdmin =
    session?.userData?.roles?.includes("admin") ||
    session?.userData?.roles?.includes("owner");
  const myUserId = session?.userData?.id;

  function canDeleteBlog(blog: AdminBlogV2) {
    return isAdmin || blog.ownerId === myUserId;
  }

  if (blogs.length === 0) {
    return <div className="text-sm text-gray-500">{emptyMessage}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {blogs.map((blog) => {
        const showDelete = canDeleteBlog(blog);

        return (
          <div
            key={blog._id}
            className="group relative border rounded-xl p-4 bg-white hover:shadow-sm transition"
          >
            <Link
              href={`/admin/blogs/v2/${blog.slug}/edit`}
              className="block"
            >
              <div className="font-medium text-gray-900 truncate pr-20">
                {blog.title || "Untitled document"}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Last edited {blog.updatedAtLabel}
              </div>
            </Link>

            <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
              <Link
                href={`/blogs/v2/${blog.slug}`}
                target="_blank"
                className="text-xs text-blue-600 hover:text-blue-800"
                onClick={(e) => e.stopPropagation()}
              >
                View
              </Link>
              {showDelete && (
                <button
                  type="button"
                  className="text-gray-400 hover:text-red-600 disabled:opacity-50"
                  disabled={deletingSlug === blog.slug}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(deleteConfirmMessage)) {
                      onDelete(blog.slug);
                    }
                  }}
                  aria-label="Delete blog"
                >
                  <FiTrash2 size={16} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
