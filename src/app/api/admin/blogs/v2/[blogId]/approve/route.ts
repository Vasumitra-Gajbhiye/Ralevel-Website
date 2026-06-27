import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { findBlogForAccess } from "@/lib/blogs-v2/access";
import { approveBlogV2Review } from "@/lib/blogs-v2/mutations";
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

  try {
    const updated = await approveBlogV2Review(blog, auth.userData.id);
    return NextResponse.json({ success: true, blog: updated });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to approve blog";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
