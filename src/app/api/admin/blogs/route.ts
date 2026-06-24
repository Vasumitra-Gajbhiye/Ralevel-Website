import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { enforceSameOrigin } from "@/lib/csrf";
import { getAdminBlogsList } from "@/lib/data/admin/blogs";
import connectDB from "@/lib/mongodb";
import { parsePaginationParams } from "@/lib/pagination";
import { slugify } from "@/lib/slugify";
import EditorBlog from "@/models/editorBlogs";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

/* ================= LIST BLOGS ================= */
export async function GET(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: ["owner", "admin", "writer"],
    rateLimit: { routeKey: "admin-blogs-list" },
  });
  if (auth instanceof Response) return auth;

  const { page, limit, skip } = parsePaginationParams(
    new URL(req.url).searchParams,
  );

  const result = await getAdminBlogsList({
    page,
    limit,
    skip,
    userId: auth.userData.id,
    roles: auth.userData.roles,
  });

  return NextResponse.json(result);
}

/* ================= CREATE BLOG ================= */
export async function POST(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: ["owner", "admin", "writer"],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

  const blog = await EditorBlog.create({
    ownerId: new mongoose.Types.ObjectId(auth.userData.id),
    title: "Untitled document",
    slug: slugify(`Untitled-${Date.now()}`),
    metadata: {
      title: "New Blog",
      author: auth.user?.name || "",
    },
    blocks: [],
  });

  return NextResponse.json(blog, { status: 201 });
}
