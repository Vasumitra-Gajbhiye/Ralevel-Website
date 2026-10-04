import { getAdminUniversity } from "@/lib/data/admin/scholarships";
import {
  authorizeScholarshipAdmin,
  jsonError,
  revalidateScholarshipSurfaces,
} from "@/lib/scholarships/adminApi";
import { isOneOf } from "@/lib/scholarships/constants";
import {
  applyUniversityAction,
  deleteUniversity,
  saveUniversity,
  UNIVERSITY_ACTIONS,
} from "@/lib/scholarships/mutations";
import { NextResponse } from "next/server";

type Context = { params: Promise<{ id: string }> };

export async function GET(req: Request, context: Context) {
  const auth = await authorizeScholarshipAdmin(req, { routeKey: "admin-universities-get" });
  if (auth instanceof Response) return auth;

  const { id } = await context.params;
  const data = await getAdminUniversity(id);
  if (!data) return jsonError("University not found", 404);
  return NextResponse.json({ data });
}

export async function PUT(req: Request, context: Context) {
  const auth = await authorizeScholarshipAdmin(req, { write: true });
  if (auth instanceof Response) return auth;

  try {
    const { id } = await context.params;
    const result = await saveUniversity(await req.json(), auth, { id });
    if (!result.ok) return jsonError(result.error, result.status);

    revalidateScholarshipSurfaces();
    return NextResponse.json({ data: { id: result.id, slug: result.slug } });
  } catch (error) {
    console.error("Update university error:", error);
    return jsonError("Failed to save university", 500);
  }
}

export async function PATCH(req: Request, context: Context) {
  const auth = await authorizeScholarshipAdmin(req, { write: true });
  if (auth instanceof Response) return auth;

  const { id } = await context.params;
  const { action } = (await req.json()) as { action?: unknown };
  if (!isOneOf(UNIVERSITY_ACTIONS, action)) return jsonError("Unknown action");

  const result = await applyUniversityAction(id, action, auth);
  if (!result.ok) return jsonError(result.error, result.status);

  revalidateScholarshipSurfaces();
  return NextResponse.json({ data: { id: result.id, slug: result.slug } });
}

export async function DELETE(req: Request, context: Context) {
  const auth = await authorizeScholarshipAdmin(req, { write: true });
  if (auth instanceof Response) return auth;

  const { id } = await context.params;
  const result = await deleteUniversity(id);
  if (!result.ok) return jsonError(result.error, result.status);

  revalidateScholarshipSurfaces();
  return NextResponse.json({ success: true });
}
