import {
  getAdminScholarships,
  parseAdminView,
} from "@/lib/data/admin/scholarships";
import {
  authorizeScholarshipAdmin,
  jsonError,
  revalidateScholarshipSurfaces,
} from "@/lib/scholarships/adminApi";
import { saveScholarship } from "@/lib/scholarships/mutations";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = await authorizeScholarshipAdmin(req, { routeKey: "admin-scholarships-list" });
  if (auth instanceof Response) return auth;

  const params = new URL(req.url).searchParams;
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1);
  const data = await getAdminScholarships({
    q: params.get("q")?.trim() ?? "",
    view: parseAdminView(params.get("view")),
    page,
  });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const auth = await authorizeScholarshipAdmin(req, { write: true });
  if (auth instanceof Response) return auth;

  try {
    const result = await saveScholarship(await req.json(), auth);
    if (!result.ok) return jsonError(result.error, result.status);

    revalidateScholarshipSurfaces();
    return NextResponse.json({ data: { id: result.id, slug: result.slug } }, { status: 201 });
  } catch (error) {
    console.error("Create scholarship error:", error);
    return jsonError("Failed to create scholarship", 500);
  }
}
