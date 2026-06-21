import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { enforceSameOrigin } from "@/lib/csrf";
import connectDB from "@/lib/mongodb";
import {
  buildPaginatedResponse,
  parsePaginationParams,
} from "@/lib/pagination";
import HelperMember from "@/models/helperMember";
import { NextResponse } from "next/server";

/* ================= GET ================= */
export async function GET(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: ["owner", "admin", "helper_dep_head"],
    rateLimit: { routeKey: "admin-helper-list" },
  });
  if (auth instanceof Response) return auth;

  await connectDB();

  const { page, limit, skip } = parsePaginationParams(new URL(req.url).searchParams);

  const [helpers, total] = await Promise.all([
    HelperMember.find()
      .sort({
        rank: 1,
        createdAt: 1,
      })
      .skip(skip)
      .limit(limit)
      .lean(),
    HelperMember.countDocuments(),
  ]);

  return NextResponse.json(buildPaginatedResponse(helpers, total, page, limit));
}

/* ================= POST ================= */
export async function POST(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: ["owner", "admin", "helper_dep_head"],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

  const helper = await HelperMember.create({});
  return NextResponse.json(helper, { status: 201 });
}

/* ================= PATCH ================= */
export async function PATCH(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: ["owner", "admin", "helper_dep_head"],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

  const { id, patch } = await req.json();
  if (!id || !patch) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const helper = await HelperMember.findById(id);
  if (!helper) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const allowedFields = [
    "username",
    "userId",
    "email",
    "rank",
    "activity",
    "promotedAt",
  ] as const;

  for (const field of allowedFields) {
    if (field in patch) {
      helper[field] = patch[field];
    }
  }

  await helper.save();
  return NextResponse.json({ success: true });
}

/* ================= DELETE ================= */
export async function DELETE(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: ["owner", "admin", "helper_dep_head"],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

  const { id } = await req.json();
  if (!id) return new Response("Invalid payload", { status: 400 });

  await HelperMember.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
