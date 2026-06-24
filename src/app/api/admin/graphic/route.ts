import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { enforceSameOrigin } from "@/lib/csrf";
import { getAdminGraphicList } from "@/lib/data/admin/graphic";
import connectDB from "@/lib/mongodb";
import { parsePaginationParams } from "@/lib/pagination";
import GraphicMember from "@/models/graphicMember";
import { NextResponse } from "next/server";

const GRAPHIC_ROLES = [
  "owner",
  "admin",
  "graphic_designer",
  "graphic_dep_head",
] as const;

/* ================= GET ================= */
export async function GET(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...GRAPHIC_ROLES],
    rateLimit: { routeKey: "admin-graphic-list" },
  });
  if (auth instanceof Response) return auth;

  const { page, limit, skip } = parsePaginationParams(
    new URL(req.url).searchParams,
  );

  const result = await getAdminGraphicList({ page, limit, skip });

  return NextResponse.json(result);
}

/* ================= POST ================= */
export async function POST(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...GRAPHIC_ROLES],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

  const created = await GraphicMember.create({});
  return NextResponse.json(created);
}

/* ================= PATCH ================= */
export async function PATCH(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...GRAPHIC_ROLES],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

  const { id, patch } = await req.json();

  if (!id || !patch) {
    return new Response("Invalid payload", { status: 400 });
  }

  await GraphicMember.findByIdAndUpdate(id, patch, {
    new: true,
  });

  return NextResponse.json({ success: true });
}

/* ================= DELETE ================= */
export async function DELETE(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...GRAPHIC_ROLES],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

  const { id } = await req.json();
  if (!id) {
    return new Response("Invalid payload", { status: 400 });
  }

  await GraphicMember.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}
