import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { enforceSameOrigin } from "@/lib/csrf";
import connectDB from "@/lib/mongodb";
import StaffMember from "@/models/staffMember";
import { NextResponse } from "next/server";

/* ================= PATCH ================= */
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await authorizeAdminApi(req, {
    roles: ["owner", "admin", "mod_dep_head"],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

  const { id } = await context.params;

  const body = await req.json();
  console.log(body, id);

  const staff = await StaffMember.findById(id);
  if (!staff) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 🔒 Only owner can modify community lead
  if (
    staff.rank === "community_lead" &&
    !auth.userData.roles.includes("owner")
  ) {
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
}

/* ================= DELETE ================= */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await authorizeAdminApi(req, {
    roles: ["owner", "admin", "mod_dep_head"],
  });
  if (auth instanceof Response) return auth;

  await connectDB();

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
}
