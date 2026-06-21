import { getAuthSession } from "@/lib/getAuthSession";
import { enforceSameOrigin } from "@/lib/csrf";
import connectDB from "@/lib/mongodb";
import { requireRoles } from "@/lib/requireRoles";
import EditorBlog from "@/models/editorBlogs";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

/* ================= GET BLOG ================= */
export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  await connectDB();
  const session = await getAuthSession();
  try {
    requireRoles(session, ["owner", "admin", "writer"]);

    const { slug } = await context.params; // ✅ REQUIRED

    const isAdminLike = session!.userData!.roles.some(
      (r) => r === "admin" || r === "owner"
    );

    const query = isAdminLike
      ? { slug }
      : {
          slug,
          ownerId: new mongoose.Types.ObjectId(session!.userData!.id),
        };

    const blog = await EditorBlog.findOne(query);

    if (!blog) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
}

/* ================= UPDATE BLOG ================= */
export async function PATCH(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  await connectDB();
  const session = await getAuthSession();
  try {
    requireRoles(session, ["owner", "admin", "writer"]);

    const csrfError = enforceSameOrigin(req);
    if (csrfError) return csrfError;

    const { slug } = await context.params; // ✅ FIX

    const isAdminLike = session!.userData!.roles.some(
      (r) => r === "admin" || r === "owner"
    );
    const query = isAdminLike
      ? { slug }
      : {
          slug,
          ownerId: new mongoose.Types.ObjectId(session!.userData!.id),
        };

    const blog = await EditorBlog.findOne(query);
    if (!blog) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();

    if (typeof body.title === "string") blog.title = body.title;
    if (body.metadata) blog.metadata = body.metadata;
    if (Array.isArray(body.blocks)) blog.blocks = body.blocks;

    await blog.save();
    return NextResponse.json({ success: true });
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
}

/* ================= DELETE BLOG ================= */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  await connectDB();
  const session = await getAuthSession();

  try {
    requireRoles(session, ["owner", "admin"]);

    const csrfError = enforceSameOrigin(req);
    if (csrfError) return csrfError;
    const { slug } = await context.params; // ✅ FIX

    const isAdmin =
      session!.userData!.roles.includes("admin") ||
      session!.userData!.roles.includes("owner");

    const query = isAdmin
      ? { slug }
      : {
          slug,
          ownerId: new mongoose.Types.ObjectId(session!.userData!.id),
        };

    await EditorBlog.findOneAndDelete(query);

    return NextResponse.json({ success: true });
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
}
