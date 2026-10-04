import {
  authorizeScholarshipAdmin,
  jsonError,
  revalidateScholarshipSurfaces,
} from "@/lib/scholarships/adminApi";
import { importRows } from "@/lib/scholarships/mutations";
import { NextResponse } from "next/server";

const MAX_ROWS = 500;

export async function POST(req: Request) {
  const auth = await authorizeScholarshipAdmin(req, {
    write: true,
    routeKey: "admin-scholarships-import",
  });
  if (auth instanceof Response) return auth;

  const body = (await req.json()) as { kind?: unknown; rows?: unknown };
  if (body.kind !== "scholarships" && body.kind !== "universities") {
    return jsonError("Unknown import type");
  }
  if (!Array.isArray(body.rows) || body.rows.length === 0 || body.rows.length > MAX_ROWS) {
    return jsonError(`Import 1–${MAX_ROWS} rows at a time`);
  }

  try {
    const result = await importRows(body.kind, body.rows, auth);
    revalidateScholarshipSurfaces();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Scholarship import error:", error);
    return jsonError("Import failed", 500);
  }
}
