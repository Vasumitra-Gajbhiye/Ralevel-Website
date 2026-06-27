import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { enforceSameOrigin } from "@/lib/csrf";
import { resolveBlogAuthorFromOwnerId } from "@/lib/data/admin/writerProfile";
import connectDB from "@/lib/mongodb";
import BlogV2 from "@/models/blogV2";
import mongoose from "mongoose";
import { WRITER_TEAM_ROLES } from "@/lib/roles";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const auth = await authorizeAdminApi(req, {
    roles: [...WRITER_TEAM_ROLES],
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
    roles: [...WRITER_TEAM_ROLES],
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
    const { author: _author, authorBio: _bio, authorFollowers: _followers, ...clientMetadata } =
      body.metadata;
    blog.metadata = { ...blog.metadata, ...clientMetadata };
  }
  if (Array.isArray(body.content)) {
    blog.content = body.content;
  }

  const ownerId = blog.ownerId?.toString();
  if (ownerId) {
    const author = await resolveBlogAuthorFromOwnerId(ownerId);
    if (author) {
      blog.metadata = {
        ...blog.metadata,
        author: author.name,
        authorBio: author.bio,
        authorFollowers: author.followerCount,
      };
    }
  }

  await blog.save();
  return NextResponse.json({ success: true, blog });
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const auth = await authorizeAdminApi(req, {
    roles: [...WRITER_TEAM_ROLES],
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
