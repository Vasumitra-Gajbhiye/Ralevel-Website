import { getAuthSession } from "@/lib/getAuthSession";
import { enforceSameOrigin } from "@/lib/csrf";
import connectDB from "@/lib/mongodb";
import { Role } from "@/lib/roles";
import ResourceSubmission from "@/models/ResourceSubmission";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

/* ================= HELPERS ================= */

function requireResourceAdminAccess(session: any): Role[] {
  const roles = session?.userData?.roles as Role[] | undefined;

  if (!roles || !roles.some((r) => ["owner", "admin"].includes(r))) {
    throw new Error("FORBIDDEN");
  }

  return roles;
}

/* ================= PATCH ================= */

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const session = await getAuthSession();

  try {
    requireResourceAdminAccess(session);

    const csrfError = enforceSameOrigin(req);
    if (csrfError) return csrfError;

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new Response("Invalid ID", { status: 400 });
    }

    const { status, adminNotes } = await req.json();

    const update: any = {};

    if (status && ["pending", "approved", "rejected"].includes(status)) {
      update.status = status;
    }

    if (adminNotes !== undefined) {
      update.adminNotes = adminNotes;
    }

    await ResourceSubmission.findByIdAndUpdate(id, update, {
      new: true,
    });

    return NextResponse.json({ success: true });
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
}
