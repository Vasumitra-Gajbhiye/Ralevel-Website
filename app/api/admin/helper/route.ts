import { getAuthSession } from "@/lib/getAuthSession";
import { enforceSameOrigin } from "@/lib/csrf";
import connectDB from "@/lib/mongodb";
import {
  buildPaginatedResponse,
  parsePaginationParams,
} from "@/lib/pagination";
import { Role } from "@/lib/roles";
import HelperMember from "@/models/helperMember";
import { NextResponse } from "next/server";

/* ================= HELPERS ================= */

function requireHelperAdmin(session: any): Role[] {
  const roles = session?.userData?.roles as Role[] | undefined;

  if (
    !roles ||
    !roles.some((r) => ["owner", "admin", "helper_dep_head"].includes(r))
  ) {
    throw new Error("FORBIDDEN");
  }

  return roles;
}

/* ================= GET ================= */
export async function GET(req: Request) {
  await connectDB();
  const session = await getAuthSession();

  try {
    requireHelperAdmin(session);

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
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
}

/* ================= POST ================= */
export async function POST(req: Request) {
  await connectDB();
  const session = await getAuthSession();

  try {
    requireHelperAdmin(session);

    const csrfError = enforceSameOrigin(req);
    if (csrfError) return csrfError;

    const helper = await HelperMember.create({});
    return NextResponse.json(helper, { status: 201 });
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
}

/* ================= PATCH ================= */
export async function PATCH(req: Request) {
  await connectDB();
  const session = await getAuthSession();

  try {
    requireHelperAdmin(session);

    const csrfError = enforceSameOrigin(req);
    if (csrfError) return csrfError;

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
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
}

/* ================= DELETE ================= */
export async function DELETE(req: Request) {
  await connectDB();
  const session = await getAuthSession();

  try {
    requireHelperAdmin(session);

    const csrfError = enforceSameOrigin(req);
    if (csrfError) return csrfError;

    const { id } = await req.json();
    if (!id) return new Response("Invalid payload", { status: 400 });

    await HelperMember.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
}
