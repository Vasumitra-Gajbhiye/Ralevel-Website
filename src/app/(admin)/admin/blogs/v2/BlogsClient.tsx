"use client";

import WriterProfileRow from "@/components/blogs-v2/WriterProfileRow";
import type { AdminBlogV2 } from "@/lib/data/admin/blogsV2";
import type {
  WriterOverviewEntry,
  WriterProfile,
} from "@/lib/data/admin/writerProfile";
import type { PaginationMeta } from "@/lib/pagination";
import { ListPagination } from "@/components/ui/list-pagination";
import type { AuthSession } from "@/types/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiTrash2 } from "react-icons/fi";

type BlogsClientBaseProps = {
  session: AuthSession | null;
};

type WriterModeProps = BlogsClientBaseProps & {
  mode: "writer";
  profile: WriterProfile | null;
  blogs: AdminBlogV2[];
  pagination: PaginationMeta;
};

type AdminOverviewModeProps = BlogsClientBaseProps & {
  mode: "admin-overview";
  writers: WriterOverviewEntry[];
  pagination: PaginationMeta;
};

type AdminDrilldownModeProps = BlogsClientBaseProps & {
  mode: "admin-drilldown";
  profile: WriterProfile | null;
  blogs: AdminBlogV2[];
  pagination: PaginationMeta;
  ownerId: string;
};

type BlogsClientProps =
  | WriterModeProps
  | AdminOverviewModeProps
  | AdminDrilldownModeProps;

export default function BlogsClient(props: BlogsClientProps) {
  const router = useRouter();
  const { session } = props;

  const isAdmin =
    session?.userData?.roles?.includes("admin") ||
    session?.userData?.roles?.includes("owner");

  const myUserId = session?.userData?.id;

  const blogs =
    props.mode === "admin-overview" ? [] : props.blogs;

  const [blogList, setBlogList] = useState(blogs);
  const [creating, setCreating] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  useEffect(() => {
    if (props.mode !== "admin-overview") {
      setBlogList(props.blogs);
    }
  }, [props]);

  async function createBlog() {
    setCreating(true);
    try {
      const res = await fetch("/api/admin/blogs/v2", { method: "POST" });
      if (!res.ok) throw new Error("Failed to create blog");
      const blog = await res.json();
      router.push(`/admin/blogs/v2/${blog.slug}/edit`);
    } finally {
      setCreating(false);
    }
  }

  async function deleteBlog(slug: string) {
    const ok = confirm(
      isAdmin
        ? "Delete this blog permanently? (Admin action)"
        : "Delete this blog permanently?",
    );
    if (!ok) return;

    setDeletingSlug(slug);
    try {
      const res = await fetch(`/api/admin/blogs/v2/${slug}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete blog");
      setBlogList((prev) => prev.filter((b) => b.slug !== slug));
      router.refresh();
    } finally {
      setDeletingSlug(null);
    }
  }

  function canDeleteBlog(blog: AdminBlogV2) {
    return isAdmin || blog.ownerId === myUserId;
  }

  function renderBlogCard(blog: AdminBlogV2) {
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
                deleteBlog(blog.slug);
              }}
              aria-label="Delete blog"
            >
              <FiTrash2 size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }

  function renderBlogGrid(items: AdminBlogV2[], emptyMessage: string) {
    if (items.length === 0) {
      return <div className="text-sm text-gray-500">{emptyMessage}</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((blog) => renderBlogCard(blog))}
      </div>
    );
  }

  function buildPageUrl(nextPage: number, ownerId?: string) {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    if (ownerId) params.set("ownerId", ownerId);
    return `/admin/blogs/v2?${params.toString()}`;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Blogs</h1>

        {(props.mode === "writer") && (
          <button
            onClick={createBlog}
            disabled={creating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? "Creating…" : "+ Create blog"}
          </button>
        )}
      </div>

      {props.mode === "writer" && props.profile && (
        <div className="mb-8">
          <WriterProfileRow
            profile={props.profile}
            editable
            apiPath="/api/admin/writer-profile"
          />
        </div>
      )}

      {props.mode === "admin-drilldown" && (
        <div className="mb-6">
          <Link
            href="/admin/blogs/v2"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            ← Back to all writers
          </Link>
        </div>
      )}

      {props.mode === "admin-drilldown" && props.profile && (
        <div className="mb-8">
          <WriterProfileRow
            profile={props.profile}
            editable
            apiPath={`/api/admin/writer-profile/${props.ownerId}`}
          />
        </div>
      )}

      {props.mode === "admin-overview" && (
        <div className="space-y-12">
          {props.writers.length === 0 ? (
            <div className="text-sm text-gray-500">No writers found.</div>
          ) : (
            props.writers.map((writer) => (
              <section key={writer.userId} className="space-y-4">
                <WriterProfileRow
                  profile={writer}
                  editable
                  apiPath={`/api/admin/writer-profile/${writer.userId}`}
                />

                {renderBlogGrid(
                  writer.recentBlogs.map((blog) => ({
                    _id: blog._id,
                    title: blog.title,
                    slug: blog.slug,
                    updatedAt: "",
                    updatedAtLabel: blog.updatedAtLabel,
                    ownerId: writer.userId,
                    ownerName: writer.name,
                    ownerEmail: writer.email,
                  })),
                  "No blogs yet.",
                )}

                {writer.totalBlogCount > writer.recentBlogs.length && (
                  <div>
                    <Link
                      href={`/admin/blogs/v2?ownerId=${writer.userId}&page=1`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      View all blogs ({writer.totalBlogCount})
                    </Link>
                  </div>
                )}
              </section>
            ))
          )}

          <ListPagination
            page={props.pagination.page}
            totalPages={props.pagination.totalPages}
            onPageChange={(nextPage) =>
              router.push(buildPageUrl(nextPage))
            }
          />
        </div>
      )}

      {props.mode === "writer" && (
        <>
          <h2 className="text-xl font-semibold mb-4">Your blogs</h2>
          {renderBlogGrid(blogList, "No blogs yet. Create your first one.")}
          <ListPagination
            page={props.pagination.page}
            totalPages={props.pagination.totalPages}
            onPageChange={(nextPage) =>
              router.push(buildPageUrl(nextPage))
            }
          />
        </>
      )}

      {props.mode === "admin-drilldown" && (
        <>
          <h2 className="text-xl font-semibold mb-4">
            {props.profile?.name ?? "Writer"}&apos;s blogs
          </h2>
          {renderBlogGrid(blogList, "No blogs yet.")}
          <ListPagination
            page={props.pagination.page}
            totalPages={props.pagination.totalPages}
            onPageChange={(nextPage) =>
              router.push(buildPageUrl(nextPage, props.ownerId))
            }
          />
        </>
      )}
    </div>
  );
}
