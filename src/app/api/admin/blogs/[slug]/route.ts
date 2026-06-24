import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { enforceSameOrigin } from "@/lib/csrf";
import connectDB from "@/lib/mongodb";
import EditorBlog from "@/models/editorBlogs";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

/* ================= GET BLOG ================= */
export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const auth = await authorizeAdminApi(req, {
    roles: ["owner", "admin", "writer"],
  });
  if (auth instanceof Response) return auth;

  await connectDB();

  const { slug } = await context.params;

  const isAdminLike = auth.userData.roles.some(
    (r) => r === "admin" || r === "owner",
  );

  const query = isAdminLike
    ? { slug }
    : {
        slug,
        ownerId: new mongoose.Types.ObjectId(auth.userData.id),
      };

  const blog = await EditorBlog.findOne(query).lean();

  if (!blog) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(blog);
}

/* ================= UPDATE BLOG ================= */
export async function PATCH(
  req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const auth = await authorizeAdminApi(req, {
    roles: ["owner", "admin", "writer"],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

  const { slug } = await context.params;

  const isAdminLike = auth.userData.roles.some(
    (r) => r === "admin" || r === "owner",
  );
  const query = isAdminLike
    ? { slug }
    : {
        slug,
        ownerId: new mongoose.Types.ObjectId(auth.userData.id),
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
}

/* ================= DELETE BLOG ================= */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const auth = await authorizeAdminApi(req, {
    roles: ["owner", "admin"],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

  const { slug } = await context.params;

  const isAdmin =
    auth.userData.roles.includes("admin") ||
    auth.userData.roles.includes("owner");

  const query = isAdmin
    ? { slug }
    : {
        slug,
        ownerId: new mongoose.Types.ObjectId(auth.userData.id),
      };

  await EditorBlog.findOneAndDelete(query);

  return NextResponse.json({ success: true });
}
