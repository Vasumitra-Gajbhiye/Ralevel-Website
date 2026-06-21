import { getAuthSession } from "@/lib/getAuthSession";
import { enforceSameOrigin } from "@/lib/csrf";
import connectDB from "@/lib/mongodb";
import {
  buildPaginatedResponse,
  parsePaginationParams,
} from "@/lib/pagination";
import { requireRoles } from "@/lib/requireRoles";
import ScheduleItem from "@/models/scheduleItem";
import { NextResponse } from "next/server";

/* ================= GET ================= */
export async function GET(req: Request) {
  await connectDB();
  const session = await getAuthSession();

  try {
    requireRoles(session, [
      "owner",
      "admin",
      "informative_team",
      "info_dep_head",
    ]);

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
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
}

/* ================= POST ================= */
export async function POST(req: Request) {
  await connectDB();
  const session = await getAuthSession();

  try {
    requireRoles(session, ["owner", "admin", "informative_team"]);

    const csrfError = enforceSameOrigin(req);
    if (csrfError) return csrfError;

    const created = await ScheduleItem.create({});
    return NextResponse.json(created);
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
}

/* ================= PATCH ================= */
export async function PATCH(req: Request) {
  await connectDB();
  const session = await getAuthSession();

  try {
    requireRoles(session, ["owner", "admin", "informative_team"]);

    const csrfError = enforceSameOrigin(req);
    if (csrfError) return csrfError;

    const { id, patch } = await req.json();
    await ScheduleItem.findByIdAndUpdate(id, patch);

    return NextResponse.json({ success: true });
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
}

/* ================= DELETE ================= */
export async function DELETE(req: Request) {
  await connectDB();
  const session = await getAuthSession();

  try {
    requireRoles(session, ["owner", "admin", "informative_team"]);

    const csrfError = enforceSameOrigin(req);
    if (csrfError) return csrfError;

    const { id } = await req.json();
    await ScheduleItem.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
}
