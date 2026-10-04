import { getAdminScholarship } from "@/lib/data/admin/scholarships";
import {
  authorizeScholarshipAdmin,
  jsonError,
  revalidateScholarshipSurfaces,
} from "@/lib/scholarships/adminApi";
import { isOneOf } from "@/lib/scholarships/constants";
import {
  applyScholarshipAction,
  deleteScholarship,
  saveScholarship,
  SCHOLARSHIP_ACTIONS,
} from "@/lib/scholarships/mutations";
import { NextResponse } from "next/server";

type Context = { params: Promise<{ id: string }> };

export async function GET(req: Request, context: Context) {
  const auth = await authorizeScholarshipAdmin(req, { routeKey: "admin-scholarships-get" });
  if (auth instanceof Response) return auth;

  const { id } = await context.params;
  const data = await getAdminScholarship(id);
  if (!data) return jsonError("Scholarship not found", 404);
  return NextResponse.json({ data });
}

/** Full save from the editor. */
export async function PUT(req: Request, context: Context) {
  const auth = await authorizeScholarshipAdmin(req, { write: true });
  if (auth instanceof Response) return auth;

  try {
    const { id } = await context.params;
    const result = await saveScholarship(await req.json(), auth, { id });
    if (!result.ok) return jsonError(result.error, result.status);

    revalidateScholarshipSurfaces();
    return NextResponse.json({ data: { id: result.id, slug: result.slug } });
  } catch (error) {
    console.error("Update scholarship error:", error);
    return jsonError("Failed to save scholarship", 500);
  }
}

/** Row actions: { action: "verify" | "rollover" | "publish" | ... } */
export async function PATCH(req: Request, context: Context) {
  const auth = await authorizeScholarshipAdmin(req, { write: true });
  if (auth instanceof Response) return auth;

  try {
    const { id } = await context.params;
    const { action } = (await req.json()) as { action?: unknown };
    if (!isOneOf(SCHOLARSHIP_ACTIONS, action)) return jsonError("Unknown action");

    const result = await applyScholarshipAction(id, action, auth);
    if (!result.ok) return jsonError(result.error, result.status);

    revalidateScholarshipSurfaces();
    return NextResponse.json({ data: { id: result.id, slug: result.slug } });
  } catch (error) {
    console.error("Scholarship action error:", error);
    return jsonError("Action failed", 500);
  }
}

export async function DELETE(req: Request, context: Context) {
  const auth = await authorizeScholarshipAdmin(req, { write: true });
  if (auth instanceof Response) return auth;

  const { id } = await context.params;
  const result = await deleteScholarship(id);
  if (!result.ok) return jsonError(result.error, result.status);

  revalidateScholarshipSurfaces();
  return NextResponse.json({ success: true });
}
