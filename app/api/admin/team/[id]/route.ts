import { authOptions } from "@/lib/auth";
import { enforceSameOrigin } from "@/lib/csrf";
import connectDB from "@/lib/mongodb";
import { Role } from "@/lib/roles";
import StaffMember from "@/models/staffMember";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

/* ================= HELPERS ================= */

function requireTeamAdmin(session: any): Role[] {
  const roles = session?.userData?.roles as Role[] | undefined;

  if (
    !roles ||
    !roles.some((r) => ["owner", "admin", "mod_dep_head"].includes(r))
  ) {
    throw new Error("FORBIDDEN");
  }

  return roles;
}

/* ================= PATCH ================= */
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const session = await getServerSession(authOptions);

  try {
    const actorRoles = requireTeamAdmin(session);

    const csrfError = enforceSameOrigin(req);
    if (csrfError) return csrfError;

    // ✅ FIX: await params
    const { id } = await context.params;

    const body = await req.json();
    console.log(body, id);

    const staff = await StaffMember.findById(id);
    if (!staff) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // 🔒 Only owner can modify community lead
    if (staff.rank === "community_lead" && !actorRoles.includes("owner")) {
      return new Response("Cannot modify community lead", { status: 403 });
    }

    const allowedFields = [
      "username",
      "email",
      "realName",
      "userId",
      "rank",
      "activity",
      "behaviour",
      "state",
      "positionStart",
      "lastPromotion",
      "notes",
    ] as const;

    for (const field of allowedFields) {
      if (field in body) {
        (staff as any)[field] = body[field];
      }
    }

    await staff.save();
    return NextResponse.json(staff);
  } catch (err) {
    console.log(err);
    return new Response("Forbidden", { status: 403 });
  }
}

/* ================= DELETE ================= */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const session = await getServerSession(authOptions);

  try {
    requireTeamAdmin(session);

    // ✅ FIX: await params
    const { id } = await context.params;

    const staff = await StaffMember.findById(id);
    if (!staff) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // 🔒 Community lead / owner can NEVER be deleted
    if (staff.rank === "community_lead") {
      return NextResponse.json({ error: "OWNER_PROTECTED" }, { status: 403 });
    }

    await staff.deleteOne();
    return NextResponse.json({ success: true });
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
}
