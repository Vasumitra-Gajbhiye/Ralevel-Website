import { getAuthSession } from "@/lib/getAuthSession";
import { enforceSameOrigin } from "@/lib/csrf";
import connectDB from "@/lib/mongodb";
import { Role } from "@/lib/roles";
import GraphicMember from "@/models/graphicMember";
import { NextResponse } from "next/server";

/* ================= HELPERS ================= */

function requireGraphicAccess(session: any): Role[] {
  const roles = session?.userData?.roles as Role[] | undefined;

  if (
    !roles ||
    !roles.some((r) =>
      ["owner", "admin", "graphic_designer", "graphic_dep_head"].includes(r)
    )
  ) {
    throw new Error("FORBIDDEN");
  }

  return roles;
}

/* ================= GET ================= */
export async function GET() {
  await connectDB();
  const session = await getAuthSession();

  try {
    requireGraphicAccess(session);

    const members = await GraphicMember.find().sort({
      createdAt: -1,
    });

    return NextResponse.json(members);
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
}

/* ================= POST ================= */
export async function POST(req: Request) {
  await connectDB();
  const session = await getAuthSession();

  try {
    requireGraphicAccess(session);

    const csrfError = enforceSameOrigin(req);
    if (csrfError) return csrfError;

    const created = await GraphicMember.create({});
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
    requireGraphicAccess(session);

    const csrfError = enforceSameOrigin(req);
    if (csrfError) return csrfError;

    const { id, patch } = await req.json();

    if (!id || !patch) {
      return new Response("Invalid payload", { status: 400 });
    }

    await GraphicMember.findByIdAndUpdate(id, patch, {
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
    requireGraphicAccess(session);

    const csrfError = enforceSameOrigin(req);
    if (csrfError) return csrfError;

    const { id } = await req.json();
    if (!id) {
      return new Response("Invalid payload", { status: 400 });
    }

    await GraphicMember.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
}
