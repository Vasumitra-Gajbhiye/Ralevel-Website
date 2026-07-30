import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { getGlobalBlogReviewHistory } from "@/lib/blogs-v2/history";
import connectDB from "@/lib/mongodb";
import { parsePaginationParams } from "@/lib/pagination";
import { BLOG_REVIEW_ROLES } from "@/lib/roles";
import type { BlogV2ReviewAction } from "@/types/blogV2";
import { NextResponse } from "next/server";

const GLOBAL_HISTORY_PAGE_SIZE = 20;

export async function GET(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...BLOG_REVIEW_ROLES],
  });
  if (auth instanceof Response) return auth;

  await connectDB();

  const { searchParams } = new URL(req.url);
  const params = new URLSearchParams(searchParams);
  if (!params.get("limit")) {
    params.set("limit", String(GLOBAL_HISTORY_PAGE_SIZE));
  }
  const { page, limit, skip } = parsePaginationParams(params);

  const blogId = searchParams.get("blogId")?.trim() || undefined;
  const actionParam = searchParams.get("action")?.trim();
  const allowedActions: BlogV2ReviewAction[] = [
    "submitted",
    "approved",
    "rejected",
    "restored",
  ];
  const action = allowedActions.includes(actionParam as BlogV2ReviewAction)
    ? (actionParam as BlogV2ReviewAction)
    : undefined;

  const result = await getGlobalBlogReviewHistory({
    page,
    limit,
    skip,
    blogId,
    action,
  });

  return NextResponse.json(result);
}
