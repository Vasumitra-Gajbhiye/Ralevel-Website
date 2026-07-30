"use client";

import BlogGlobalHistoryTab from "@/components/blogs-v2/BlogGlobalHistoryTab";
import BlogReviewActions from "@/components/blogs-v2/BlogReviewActions";
import BlogV2AdminGrid from "@/components/blogs-v2/BlogV2AdminGrid";
import WriterProfileRow from "@/components/blogs-v2/WriterProfileRow";
import type { AdminBlogV2, PendingBlogReview } from "@/lib/data/admin/blogsV2";
import type {
  WriterOverviewEntry,
  WriterProfile,
} from "@/lib/data/admin/writerProfile";
import type { PaginationMeta } from "@/lib/pagination";
import { ListPagination } from "@/components/ui/list-pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AuthSession } from "@/types/auth";
import type { BlogV2GlobalHistoryEntry } from "@/types/blogV2";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type AllBlogsClientBaseProps = {
  session: AuthSession | null;
  pendingBlogs: PendingBlogReview[];
  pendingPagination: PaginationMeta;
  historyEntries: BlogV2GlobalHistoryEntry[];
  historyPagination: PaginationMeta;
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
  const searchParams = useSearchParams();
  const { session } = props;

  const tabParam = searchParams.get("tab");
  const activeTab =
    tabParam === "pending"
      ? "pending"
      : tabParam === "history"
        ? "history"
        : "all";

  const blogs = props.mode === "admin-overview" ? [] : props.blogs;

  const [blogList, setBlogList] = useState(blogs);
  const [deletingBlogId, setDeletingBlogId] = useState<string | null>(null);

  useEffect(() => {
    if (props.mode !== "admin-overview") {
      setBlogList(props.blogs);
    }
  }, [props]);

  async function deleteBlog(blogId: string) {
    setDeletingBlogId(blogId);
    try {
      const res = await fetch(`/api/admin/blogs/v2/${blogId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete blog");
      setBlogList((prev) => prev.filter((b) => b._id !== blogId));
      router.refresh();
    } finally {
      setDeletingBlogId(null);
    }
  }

  function buildPageUrl(nextPage: number, ownerId?: string, tab?: string) {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    if (ownerId) params.set("ownerId", ownerId);
    if (tab && tab !== "all") params.set("tab", tab);
    return `/admin/all-blogs?${params.toString()}`;
  }

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("tab");
    } else {
      params.set("tab", value);
    }
    params.set("page", "1");
    router.push(`/admin/all-blogs?${params.toString()}`);
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">All Blogs</h1>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All blogs</TabsTrigger>
          <TabsTrigger value="pending">
            Pending approval
            {props.pendingPagination.total > 0 && (
              <span className="ml-2 rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-xs">
                {props.pendingPagination.total}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {props.mode === "admin-drilldown" && (
            <div className="mb-2">
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
                        status: blog.status,
                        updatedAt: "",
                        updatedAtLabel: blog.updatedAtLabel,
                        ownerId: writer.userId,
                        ownerName: writer.name,
                        ownerEmail: writer.email,
                      }))}
                      emptyMessage="No blogs yet."
                      session={session}
                      deletingBlogId={deletingBlogId}
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
                deletingBlogId={deletingBlogId}
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
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {props.pendingBlogs.length === 0 ? (
            <div className="text-sm text-gray-500">
              No blogs waiting for approval.
            </div>
          ) : (
            props.pendingBlogs.map((blog) => (
              <BlogReviewActions key={blog._id} blog={blog} />
            ))
          )}
          <ListPagination
            page={props.pendingPagination.page}
            totalPages={props.pendingPagination.totalPages}
            onPageChange={(nextPage) =>
              router.push(buildPageUrl(nextPage, undefined, "pending"))
            }
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <BlogGlobalHistoryTab
            entries={props.historyEntries}
            pagination={props.historyPagination}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
