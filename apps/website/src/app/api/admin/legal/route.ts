import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { getAdminLegalPages } from "@/lib/data/admin/legalPages";
import { LEGAL_ADMIN_ROLES } from "@/lib/legal-pages";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...LEGAL_ADMIN_ROLES],
    rateLimit: { routeKey: "admin-legal-list" },
  });
  if (auth instanceof Response) return auth;

  const data = await getAdminLegalPages();
  return NextResponse.json({ data });
}
