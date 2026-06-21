"use client";

import { ListPagination } from "@/components/ui/list-pagination";
import type { AdminBlog } from "@/lib/data/admin/blogs";
import type { PaginationMeta } from "@/lib/pagination";
import type { AuthSession } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiTrash2 } from "react-icons/fi";

export default function AdminBlogsClient({
  session,
  initialBlogs,
  pagination,
}: {
  session: AuthSession | null;
  initialBlogs: AdminBlog[];
  pagination: PaginationMeta;
}) {
  const router = useRouter();

  const [blogs, setBlogs] = useState(initialBlogs);

  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [savingSlug, setSavingSlug] = useState<string | null>(null);

  const isAdmin =
    session?.userData?.roles?.includes("admin") ||
    session?.userData?.roles?.includes("owner");

  useEffect(() => {
    setBlogs(initialBlogs);
  }, [initialBlogs]);

  /* ---------------- create blog ---------------- */
  async function createBlog() {
    const res = await fetch("/api/admin/blogs", {
      method: "POST",
    });

    const blog = await res.json();
    router.push(`/playground/${blog.slug}`);
  }

  /* ---------------- rename blog ---------------- */
  async function saveTitle(slug: string) {
    if (!titleDraft.trim()) {
      setEditingSlug(null);
      return;
    }

    setSavingSlug(slug);

    await fetch(`/api/admin/blogs/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: titleDraft }),
    });

    setEditingSlug(null);
    setSavingSlug(null);
    router.refresh();
  }

  /* ---------------- delete blog ---------------- */
  async function deleteBlog(slug: string) {
    const ok = confirm(
      isAdmin
        ? "Delete this blog permanently? (Admin action)"
        : "Delete this blog permanently?"
    );
    if (!ok) return;

    await fetch(`/api/admin/blogs/${slug}`, {
      method: "DELETE",
    });

    router.refresh();
  }

  // Group blogs by ownerId
  const blogsByOwner = blogs.reduce<Record<string, AdminBlog[]>>((acc, blog) => {
    const key = blog.ownerId ?? "unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(blog);
    return acc;
  }, {});

  const myUserId = session?.userData?.id;
  const myBlogs = myUserId ? blogsByOwner[myUserId] ?? [] : [];

  const otherOwners = Object.keys(blogsByOwner).filter(
    (ownerId) => ownerId !== myUserId
  );

  function renderBlogCard(blog: AdminBlog) {
    const isEditing = editingSlug === blog.slug;

    return (
      <div
        key={blog._id}
        className="group relative border rounded-xl p-4 bg-white hover:shadow-sm transition"
        onClick={() => {
          if (!isEditing) router.push(`/playground/${blog.slug}`);
        }}
      >
        {/* Title */}
        {isEditing ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={() => saveTitle(blog.slug)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveTitle(blog.slug);
              if (e.key === "Escape") setEditingSlug(null);
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full text-sm font-semibold border-b outline-none"
          />
        ) : (
          <div
            className="font-medium text-gray-900 truncate cursor-text"
            onClick={(e) => {
              e.stopPropagation();
              setEditingSlug(blog.slug);
              setTitleDraft(blog.title || "Untitled document");
            }}
          >
            {blog.title || "Untitled document"}
          </div>
        )}

        <div className="text-xs text-gray-500 mt-1">
          Last edited {new Date(blog.updatedAt).toLocaleDateString()}
        </div>

        <button
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700"
          onClick={(e) => {
            e.stopPropagation();
            deleteBlog(blog.slug);
          }}
        >
          <FiTrash2 size={16} />
        </button>
      </div>
    );
  }

  /* ================= RENDER ================= */

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Blogs</h1>

        <button
          onClick={createBlog}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          + New blog
        </button>
      </div>
      {isAdmin && (
        <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-2 text-sm text-yellow-800">
          You are viewing <strong>all blogs</strong> as an admin.
        </div>
      )}
      {/* Content */}
      {blogs.length === 0 ? (
        <div className="text-sm text-gray-500">
          No blogs yet. Create your first one.
        </div>
      ) : (
        <div className="space-y-10">
          {/* ================= MY BLOGS ================= */}
          {myBlogs.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-semibold mb-4">Your blogs</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myBlogs.map((blog) => renderBlogCard(blog))}
              </div>
            </section>
          )}

          {/* ================= OTHER USERS ================= */}
          {otherOwners.map((ownerId) => {
            const ownerBlogs = blogsByOwner[ownerId];
            const owner = ownerBlogs[0];

            return (
              <section key={ownerId} className="mb-12">
                <h2 className="text-lg font-semibold text-gray-800">
                  {owner.ownerName || "User"}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  {owner.ownerEmail || "Unknown email"}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ownerBlogs.map((blog) => renderBlogCard(blog))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <ListPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(nextPage) =>
          router.push(`/admin/blogs?page=${nextPage}`)
        }
      />
    </div>
  );
}
