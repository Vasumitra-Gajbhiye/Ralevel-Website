"use client";

import BlogV2AdminGrid from "@/components/blogs-v2/BlogV2AdminGrid";
import WriterProfileRow from "@/components/blogs-v2/WriterProfileRow";
import WriterRoleGate from "@/components/blogs-v2/WriterRoleGate";
import type { AdminBlogV2 } from "@/lib/data/admin/blogsV2";
import type { WriterProfile } from "@/lib/data/admin/writerProfile";
import type { PaginationMeta } from "@/lib/pagination";
import { ListPagination } from "@/components/ui/list-pagination";
import type { AuthSession } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type BlogsClientGatedProps = {
  session: AuthSession | null;
  needsWriterRole: true;
};

type BlogsClientLoadedProps = {
  session: AuthSession | null;
  profile: WriterProfile | null;
  blogs: AdminBlogV2[];
  pagination: PaginationMeta;
  needsWriterRole?: false;
};

type BlogsClientProps = BlogsClientGatedProps | BlogsClientLoadedProps;

export default function BlogsClient(props: BlogsClientProps) {
  const router = useRouter();
  const needsWriterRole = props.needsWriterRole === true;

  const blogs = needsWriterRole ? [] : props.blogs;
  const pagination = needsWriterRole
    ? { page: 1, totalPages: 1, total: 0, limit: 12 }
    : props.pagination;
  const profile = needsWriterRole ? null : props.profile;
  const session = props.session;

  const [blogList, setBlogList] = useState(blogs);
  const [creating, setCreating] = useState(false);
  const [deletingBlogId, setDeletingBlogId] = useState<string | null>(null);

  useEffect(() => {
    if (!needsWriterRole) {
      setBlogList(props.blogs);
    }
  }, [needsWriterRole, props]);

  async function createBlog() {
    setCreating(true);
    try {
      const res = await fetch("/api/admin/blogs/v2", { method: "POST" });
      if (!res.ok) throw new Error("Failed to create blog");
      const blog = await res.json();
      router.push(`/admin/blogs/v2/${blog._id}/edit`);
    } finally {
      setCreating(false);
    }
  }

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

  function buildPageUrl(nextPage: number) {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    return `/admin/blogs/v2?${params.toString()}`;
  }

  return (
    <WriterRoleGate needsWriterRole={needsWriterRole}>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Blogs</h1>
          <button
            onClick={createBlog}
            disabled={creating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? "Creating…" : "+ Create blog"}
          </button>
        </div>

        {profile && (
          <div className="mb-8">
            <WriterProfileRow
              profile={profile}
              editable
              apiPath="/api/admin/writer-profile"
            />
          </div>
        )}

        <h2 className="text-xl font-semibold mb-4">Your blogs</h2>
        <BlogV2AdminGrid
          blogs={blogList}
          emptyMessage="No blogs yet. Create your first one."
          session={session}
          deletingBlogId={deletingBlogId}
          onDelete={deleteBlog}
        />
        <ListPagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(nextPage) => router.push(buildPageUrl(nextPage))}
        />
      </div>
    </WriterRoleGate>
  );
}
