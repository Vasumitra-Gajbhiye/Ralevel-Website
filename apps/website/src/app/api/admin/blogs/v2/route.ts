import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { enforceSameOrigin } from "@/lib/csrf";
import { getAdminBlogsV2List } from "@/lib/data/admin/blogsV2";
import { resolveBlogAuthorFromOwnerId } from "@/lib/data/admin/writerProfile";
import { ensureBlogV2Migrated } from "@/lib/blogs-v2/migrate";
import connectDB from "@/lib/mongodb";
import { parsePaginationParams } from "@/lib/pagination";
import BlogV2 from "@/models/blogV2";
import { randomBytes } from "crypto";
import mongoose from "mongoose";
import { WRITER_TEAM_ROLES } from "@/lib/roles";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...WRITER_TEAM_ROLES],
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
  });

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...WRITER_TEAM_ROLES],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();
  await ensureBlogV2Migrated();

  const author = await resolveBlogAuthorFromOwnerId(auth.userData.id);
  const authorName = author?.name ?? "Writer";
  const today = new Date().toISOString().split("T")[0];

  const blog = await BlogV2.create({
    ownerId: new mongoose.Types.ObjectId(auth.userData.id),
    title: "Untitled document",
    status: "draft",
    previewToken: randomBytes(24).toString("hex"),
    metadata: {
      title: "Untitled document",
      author: authorName,
      authorBio: author?.bio,
      authorFollowers: author?.followerCount ?? 0,
      date: today,
    },
    content: [],
  });

  return NextResponse.json(blog, { status: 201 });
}
