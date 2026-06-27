import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { findBlogForAccess } from "@/lib/blogs-v2/access";
import { restoreBlogV2Version } from "@/lib/blogs-v2/versions";
import { enforceSameOrigin } from "@/lib/csrf";
import connectDB from "@/lib/mongodb";
import { WRITER_TEAM_ROLES } from "@/lib/roles";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: {
    params: Promise<{ blogId: string; versionId: string }>;
  },
) {
  const auth = await authorizeAdminApi(req, {
    roles: [...WRITER_TEAM_ROLES],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

  const { blogId, versionId } = await context.params;
  const blog = await findBlogForAccess(
    blogId,
    auth.userData.id,
    auth.userData.roles,
  );

  if (!blog) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const updated = await restoreBlogV2Version(
      blog,
      versionId,
      auth.userData.id,
    );
    return NextResponse.json({ success: true, blog: updated });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to restore version";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
