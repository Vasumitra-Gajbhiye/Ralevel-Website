import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { enforceSameOrigin } from "@/lib/csrf";
import { getAdminBlogsV2List } from "@/lib/data/admin/blogsV2";
import connectDB from "@/lib/mongodb";
import { parsePaginationParams } from "@/lib/pagination";
import { slugify } from "@/lib/slugify";
import BlogV2 from "@/models/blogV2";
import mongoose from "mongoose";
import { WRITER_CMS_ROLES } from "@/lib/roles";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...WRITER_CMS_ROLES],
    rateLimit: { routeKey: "admin-blogs-v2-list" },
  });
  if (auth instanceof Response) return auth;

  const { page, limit, skip } = parsePaginationParams(
    new URL(req.url).searchParams,
  );

  const result = await getAdminBlogsV2List({
    page,
    limit,
    skip,
    userId: auth.userData.id,
    roles: auth.userData.roles,
  });

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...WRITER_CMS_ROLES],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

  const authorName = auth.user?.name || "";
  const today = new Date().toISOString().split("T")[0];

  const blog = await BlogV2.create({
    ownerId: new mongoose.Types.ObjectId(auth.userData.id),
    title: "Untitled document",
    slug: slugify(`Untitled-${Date.now()}`),
    metadata: {
      title: "Untitled document",
      author: authorName,
      date: today,
    },
    content: [],
  });

  return NextResponse.json(blog, { status: 201 });
}
