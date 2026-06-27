import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { findBlogForAccess } from "@/lib/blogs-v2/access";
import {
  getBlogHistoryTimeline,
  resolveLastApproverName,
} from "@/lib/blogs-v2/history";
import { listBlogV2Versions } from "@/lib/blogs-v2/versions";
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

  const [timeline, versions, approver] = await Promise.all([
    getBlogHistoryTimeline(blogId),
    listBlogV2Versions(blogId),
    resolveLastApproverName(blogId),
  ]);

  return NextResponse.json({
    timeline,
    versions,
    lastApprover: approver,
  });
}
