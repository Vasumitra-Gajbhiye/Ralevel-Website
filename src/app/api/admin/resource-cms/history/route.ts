import { authorizeAdminApi } from "@/lib/adminApiAuth";
import {
  listResourceCMSRevisionActors,
  listResourceCMSRevisions,
} from "@/lib/data/admin/resource-cms-revisions";
import { parseResourceCMSHistoryFilters } from "@/lib/resource-cms/history-filters";
import { parsePaginationParams } from "@/lib/pagination";
import { RESOURCE_CMS_ROLES } from "@/lib/roles";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...RESOURCE_CMS_ROLES],
    rateLimit: { routeKey: "admin-resource-cms-history" },
  });
  if (auth instanceof Response) return auth;

  const searchParams = new URL(req.url).searchParams;
  const { page, limit, skip } = parsePaginationParams(searchParams);
  const filters = parseResourceCMSHistoryFilters(searchParams);

  const result = await listResourceCMSRevisions({
    page,
    limit,
    skip,
    filters,
  });

  return NextResponse.json(result);
}
