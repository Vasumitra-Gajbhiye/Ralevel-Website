import { getAuthSession } from "@/lib/getAuthSession";
import { enforceSameOrigin } from "@/lib/csrf";
import connectDB from "@/lib/mongodb";
import { requireRoles } from "@/lib/requireRoles";
import ResourceSubmission from "@/models/ResourceSubmission";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

/* ================= PATCH ================= */

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const session = await getAuthSession();

  try {
    requireRoles(session, ["owner", "admin"]);

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
