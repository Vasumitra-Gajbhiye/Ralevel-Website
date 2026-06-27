"use client";

import BlogV2AdminGrid from "@/components/blogs-v2/BlogV2AdminGrid";
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

type AllBlogsClientBaseProps = {
  session: AuthSession | null;
};

type AdminOverviewModeProps = AllBlogsClientBaseProps & {
  mode: "admin-overview";
  writers: WriterOverviewEntry[];
  pagination: PaginationMeta;
};

type AdminDrilldownModeProps = AllBlogsClientBaseProps & {
  mode: "admin-drilldown";
  profile: WriterProfile | null;
  blogs: AdminBlogV2[];
  pagination: PaginationMeta;
  ownerId: string;
};

type AllBlogsClientProps = AdminOverviewModeProps | AdminDrilldownModeProps;

export default function AllBlogsClient(props: AllBlogsClientProps) {
  const router = useRouter();
  const { session } = props;

  const blogs = props.mode === "admin-overview" ? [] : props.blogs;

  const [blogList, setBlogList] = useState(blogs);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  useEffect(() => {
    if (props.mode !== "admin-overview") {
      setBlogList(props.blogs);
    }
  }, [props]);

  async function deleteBlog(slug: string) {
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

  function buildPageUrl(nextPage: number, ownerId?: string) {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    if (ownerId) params.set("ownerId", ownerId);
    return `/admin/all-blogs?${params.toString()}`;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">All Blogs</h1>
      </div>

      {props.mode === "admin-drilldown" && (
        <div className="mb-6">
          <Link
            href="/admin/all-blogs"
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

                <BlogV2AdminGrid
                  blogs={writer.recentBlogs.map((blog) => ({
                    _id: blog._id,
                    title: blog.title,
                    slug: blog.slug,
                    updatedAt: "",
                    updatedAtLabel: blog.updatedAtLabel,
                    ownerId: writer.userId,
                    ownerName: writer.name,
                    ownerEmail: writer.email,
                  }))}
                  emptyMessage="No blogs yet."
                  session={session}
                  deletingSlug={deletingSlug}
                  onDelete={deleteBlog}
                  deleteConfirmMessage="Delete this blog permanently? (Admin action)"
                />

                {writer.totalBlogCount > writer.recentBlogs.length && (
                  <div>
                    <Link
                      href={`/admin/all-blogs?ownerId=${writer.userId}&page=1`}
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

      {props.mode === "admin-drilldown" && (
        <>
          <h2 className="text-xl font-semibold mb-4">
            {props.profile?.name ?? "Writer"}&apos;s blogs
          </h2>
          <BlogV2AdminGrid
            blogs={blogList}
            emptyMessage="No blogs yet."
            session={session}
            deletingSlug={deletingSlug}
            onDelete={deleteBlog}
            deleteConfirmMessage="Delete this blog permanently? (Admin action)"
          />
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
