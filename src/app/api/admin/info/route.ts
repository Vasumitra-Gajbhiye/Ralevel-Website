import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { enforceSameOrigin } from "@/lib/csrf";
import { getAdminInfoList } from "@/lib/data/admin/info";
import connectDB from "@/lib/mongodb";
import { parsePaginationParams } from "@/lib/pagination";
import InformativeMember from "@/models/informativeMember";
import { NextResponse } from "next/server";

const INFO_ROLES = [
  "owner",
  "admin",
  "informative_team",
  "info_dep_head",
] as const;

/* ================= GET ================= */
export async function GET(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...INFO_ROLES],
    rateLimit: { routeKey: "admin-info-list" },
  });
  if (auth instanceof Response) return auth;

  const { page, limit, skip } = parsePaginationParams(
    new URL(req.url).searchParams,
  );

  const result = await getAdminInfoList({ page, limit, skip });

  return NextResponse.json(result);
}

/* ================= POST ================= */
export async function POST(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...INFO_ROLES],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

  const created = await InformativeMember.create({});
  return NextResponse.json(created);
}

/* ================= PATCH ================= */
export async function PATCH(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...INFO_ROLES],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

  const { id, patch } = await req.json();
  if (!id || !patch) {
    return new Response("Invalid payload", { status: 400 });
  }

  await InformativeMember.findByIdAndUpdate(id, patch, {
    new: true,
  });

  return NextResponse.json({ success: true });
}

/* ================= DELETE ================= */
export async function DELETE(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...INFO_ROLES],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

  const { id } = await req.json();
  if (!id) return new Response("Invalid payload", { status: 400 });

  await InformativeMember.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}
