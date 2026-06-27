import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { getPendingBlogReviews } from "@/lib/data/admin/blogsV2";
import { parsePaginationParams } from "@/lib/pagination";
import { BLOG_REVIEW_ROLES } from "@/lib/roles";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...BLOG_REVIEW_ROLES],
    rateLimit: { routeKey: "admin-blogs-v2-pending" },
  });
  if (auth instanceof Response) return auth;

  const { page, limit, skip } = parsePaginationParams(
    new URL(req.url).searchParams,
  );

  const result = await getPendingBlogReviews({ page, limit, skip });
  return NextResponse.json(result);
}
