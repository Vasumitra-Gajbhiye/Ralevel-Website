import { getAuthSession } from "@/lib/getAuthSession";
import { enforceSameOrigin } from "@/lib/csrf";
import connectDB from "@/lib/mongodb";
import {
  buildPaginatedResponse,
  parsePaginationParams,
} from "@/lib/pagination";
import { requireRoles } from "@/lib/requireRoles";
import InformativeMember from "@/models/informativeMember";
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

    const [members, total] = await Promise.all([
      InformativeMember.find()
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),
      InformativeMember.countDocuments(),
    ]);

    return NextResponse.json(buildPaginatedResponse(members, total, page, limit));
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
}

/* ================= POST ================= */
export async function POST(req: Request) {
  await connectDB();
  const session = await getAuthSession();

  try {
    requireRoles(session, [
      "owner",
      "admin",
      "informative_team",
      "info_dep_head",
    ]);

    const csrfError = enforceSameOrigin(req);
    if (csrfError) return csrfError;

    const created = await InformativeMember.create({});
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
    requireRoles(session, [
      "owner",
      "admin",
      "informative_team",
      "info_dep_head",
    ]);

    const csrfError = enforceSameOrigin(req);
    if (csrfError) return csrfError;

    const { id, patch } = await req.json();
    if (!id || !patch) {
      return new Response("Invalid payload", { status: 400 });
    }

    await InformativeMember.findByIdAndUpdate(id, patch, {
      new: true,
    });

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
    requireRoles(session, [
      "owner",
      "admin",
      "informative_team",
      "info_dep_head",
    ]);

    const csrfError = enforceSameOrigin(req);
    if (csrfError) return csrfError;

    const { id } = await req.json();
    if (!id) return new Response("Invalid payload", { status: 400 });

    await InformativeMember.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
}
