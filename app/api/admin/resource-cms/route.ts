import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { getAdminResourceSubjectsList } from "@/lib/data/admin/resource-cms";
import { parsePaginationParams } from "@/lib/pagination";
import { RESOURCE_CMS_ROLES } from "@/lib/roles";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...RESOURCE_CMS_ROLES],
    rateLimit: { routeKey: "admin-resource-cms-list" },
  });
  if (auth instanceof Response) return auth;

  const { page, limit, skip } = parsePaginationParams(
    new URL(req.url).searchParams
  );

  const result = await getAdminResourceSubjectsList({ page, limit, skip });

  return NextResponse.json(result);
}
