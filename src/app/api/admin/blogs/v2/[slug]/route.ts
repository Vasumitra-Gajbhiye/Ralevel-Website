import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { enforceSameOrigin } from "@/lib/csrf";
import connectDB from "@/lib/mongodb";
import BlogV2 from "@/models/blogV2";
import mongoose from "mongoose";
import { WRITER_CMS_ROLES } from "@/lib/roles";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const auth = await authorizeAdminApi(req, {
    roles: [...WRITER_CMS_ROLES],
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

  const blog = await BlogV2.findOne(query).lean();

  if (!blog) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(blog);
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const auth = await authorizeAdminApi(req, {
    roles: [...WRITER_CMS_ROLES],
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

  const blog = await BlogV2.findOne(query);
  if (!blog) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();

  if (typeof body.title === "string") {
    blog.title = body.title;
  }
  if (body.metadata) {
    blog.metadata = { ...blog.metadata, ...body.metadata };
  }
  if (Array.isArray(body.content)) {
    blog.content = body.content;
  }

  await blog.save();
  return NextResponse.json({ success: true, blog });
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const auth = await authorizeAdminApi(req, {
    roles: [...WRITER_CMS_ROLES],
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

  const result = await BlogV2.findOneAndDelete(query);
  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
