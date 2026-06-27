import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { findBlogForAccess } from "@/lib/blogs-v2/access";
import { saveBlogV2Draft } from "@/lib/blogs-v2/mutations";
import { enforceSameOrigin } from "@/lib/csrf";
import connectDB from "@/lib/mongodb";
import { WRITER_TEAM_ROLES } from "@/lib/roles";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ blogId: string }> },
) {
  const auth = await authorizeAdminApi(req, {
    roles: [...WRITER_TEAM_ROLES],
  });
  if (auth instanceof Response) return auth;

  await connectDB();

  const { blogId } = await context.params;
  const blog = await findBlogForAccess(
    blogId,
    auth.userData.id,
    auth.userData.roles,
  );

  if (!blog) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(blog);
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ blogId: string }> },
) {
  const auth = await authorizeAdminApi(req, {
    roles: [...WRITER_TEAM_ROLES],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

  const { blogId } = await context.params;
  const blog = await findBlogForAccess(
    blogId,
    auth.userData.id,
    auth.userData.roles,
  );

  if (!blog) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();

  try {
    const updated = await saveBlogV2Draft(blog, {
      title: typeof body.title === "string" ? body.title : undefined,
      metadata: body.metadata,
      content: Array.isArray(body.content) ? body.content : undefined,
    });

    return NextResponse.json({ success: true, blog: updated });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save draft";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ blogId: string }> },
) {
  const auth = await authorizeAdminApi(req, {
    roles: [...WRITER_TEAM_ROLES],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

  const { blogId } = await context.params;
  const blog = await findBlogForAccess(
    blogId,
    auth.userData.id,
    auth.userData.roles,
  );

  if (!blog) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await blog.deleteOne();
  return NextResponse.json({ success: true });
}
