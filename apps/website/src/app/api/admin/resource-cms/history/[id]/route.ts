import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { getResourceCMSRevision } from "@/lib/data/admin/resource-cms-revisions";
import { RESOURCE_CMS_ROLES } from "@/lib/roles";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await authorizeAdminApi(req, {
    roles: [...RESOURCE_CMS_ROLES],
  });
  if (auth instanceof Response) return auth;

  const { id } = await context.params;
  const revision = await getResourceCMSRevision(id);

  if (!revision) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(revision);
}
