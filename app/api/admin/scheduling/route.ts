import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { enforceSameOrigin } from "@/lib/csrf";
import connectDB from "@/lib/mongodb";
import {
  buildPaginatedResponse,
  parsePaginationParams,
} from "@/lib/pagination";
import ScheduleItem from "@/models/scheduleItem";
import { NextResponse } from "next/server";

const SCHEDULING_READ_ROLES = [
  "owner",
  "admin",
  "informative_team",
  "info_dep_head",
] as const;

/* ================= GET ================= */
export async function GET(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...SCHEDULING_READ_ROLES],
    rateLimit: { routeKey: "admin-scheduling-list" },
  });
  if (auth instanceof Response) return auth;

  await connectDB();

  const { page, limit, skip } = parsePaginationParams(new URL(req.url).searchParams);

  const [items, total] = await Promise.all([
    ScheduleItem.find()
      .sort({
        date: 1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean(),
    ScheduleItem.countDocuments(),
  ]);

  return NextResponse.json(buildPaginatedResponse(items, total, page, limit));
}

/* ================= POST ================= */
export async function POST(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: ["owner", "admin", "informative_team"],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

  const created = await ScheduleItem.create({});
  return NextResponse.json(created);
}

/* ================= PATCH ================= */
export async function PATCH(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: ["owner", "admin", "informative_team"],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

  const { id, patch } = await req.json();
  await ScheduleItem.findByIdAndUpdate(id, patch);

  return NextResponse.json({ success: true });
}

/* ================= DELETE ================= */
export async function DELETE(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: ["owner", "admin", "informative_team"],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

  const { id } = await req.json();
  await ScheduleItem.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}
