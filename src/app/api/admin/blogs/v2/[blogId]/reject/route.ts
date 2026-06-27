import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { findBlogForAccess } from "@/lib/blogs-v2/access";
import { rejectBlogV2Review } from "@/lib/blogs-v2/mutations";
import { enforceSameOrigin } from "@/lib/csrf";
import connectDB from "@/lib/mongodb";
import { BLOG_REVIEW_ROLES } from "@/lib/roles";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: { params: Promise<{ blogId: string }> },
) {
  const auth = await authorizeAdminApi(req, {
    roles: [...BLOG_REVIEW_ROLES],
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
  const note = typeof body.note === "string" ? body.note : "";

  try {
    const updated = await rejectBlogV2Review(blog, auth.userData.id, note);
    return NextResponse.json({ success: true, blog: updated });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to reject blog";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
