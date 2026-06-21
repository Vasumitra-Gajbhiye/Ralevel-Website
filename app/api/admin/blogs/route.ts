import { getAuthSession } from "@/lib/getAuthSession";
import { enforceSameOrigin } from "@/lib/csrf";
import connectDB from "@/lib/mongodb";
import {
  buildPaginatedResponse,
  parsePaginationParams,
} from "@/lib/pagination";
import { requireRoles } from "@/lib/requireRoles";
import { slugify } from "@/lib/slugify";
import EditorBlog from "@/models/editorBlogs";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

/* ================= LIST BLOGS ================= */
export async function GET(req: Request) {
  await connectDB();
  const session = await getAuthSession();

  try {
    // writers see own, admins see all
    requireRoles(session, ["owner", "admin", "writer"]);

    const { page, limit, skip } = parsePaginationParams(new URL(req.url).searchParams);

    const isAdminLike = session!.userData!.roles.some(
      (r) => r === "admin" || r === "owner"
    );

    const match = isAdminLike
      ? {}
      : { ownerId: new mongoose.Types.ObjectId(session!.userData!.id) };

    const [result] = await EditorBlog.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "userdatas",
          localField: "ownerId",
          foreignField: "_id",
          as: "owner",
        },
      },
      { $unwind: "$owner" },
      {
        $project: {
          title: 1,
          slug: 1,
          updatedAt: 1,
          ownerId: 1,
          ownerName: "$owner.name",
          ownerEmail: "$owner.email",
        },
      },
      { $sort: { updatedAt: -1 } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ]);

    const total = result.metadata[0]?.total ?? 0;
    const blogs = result.data;

    return NextResponse.json(buildPaginatedResponse(blogs, total, page, limit));
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
}

/* ================= CREATE BLOG ================= */
export async function POST(req: Request) {
  await connectDB();
  const session = await getAuthSession();
  try {
    requireRoles(session, ["owner", "admin", "writer"]);

    const csrfError = enforceSameOrigin(req);
    if (csrfError) return csrfError;

    const blog = await EditorBlog.create({
      ownerId: new mongoose.Types.ObjectId(session!.userData!.id),
      title: "Untitled document",
      slug: slugify(`Untitled-${Date.now()}`),
      metadata: {
        title: "New Blog",
        author: session?.user?.name || "",
      },
      blocks: [],
    });

    return NextResponse.json(blog, { status: 201 });
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
}
