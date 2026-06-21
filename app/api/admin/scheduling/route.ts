import { getAuthSession } from "@/lib/getAuthSession";
import { enforceSameOrigin } from "@/lib/csrf";
import connectDB from "@/lib/mongodb";
import { requireRoles } from "@/lib/requireRoles";
import ScheduleItem from "@/models/scheduleItem";
import { NextResponse } from "next/server";

/* ================= GET ================= */
export async function GET() {
  await connectDB();
  const session = await getAuthSession();

  try {
    requireRoles(session, [
      "owner",
      "admin",
      "informative_team",
      "info_dep_head",
    ]);

    const items = await ScheduleItem.find().sort({
      date: 1,
      createdAt: -1,
    });

    return NextResponse.json(items);
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
