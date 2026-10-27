import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { getAdminLegalPages } from "@/lib/data/admin/legalPages";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = await authorizeAdminApi(req, {
    section: "legal",
    rateLimit: { routeKey: "admin-legal-list" },
  });
  if (auth instanceof Response) return auth;

  const data = await getAdminLegalPages();
  return NextResponse.json({ data });
}
