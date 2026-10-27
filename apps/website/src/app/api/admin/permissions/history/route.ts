import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { getPermissionHistory } from "@/lib/data/admin/permissions";
import { permissionsHistoryQuerySchema } from "@/lib/validation/permissions";
import { firstIssue } from "@/lib/validation/scholarships";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = await authorizeAdminApi(req, {
    section: "permissions",
    rateLimit: { routeKey: "admin-permissions-history" },
  });
  if (auth instanceof Response) return auth;

  const params = Object.fromEntries(new URL(req.url).searchParams);
  const parsed = permissionsHistoryQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }

  return NextResponse.json(await getPermissionHistory(parsed.data));
}
