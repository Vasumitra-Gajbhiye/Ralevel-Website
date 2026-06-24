import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { enforceSameOrigin } from "@/lib/csrf";
import connectDB from "@/lib/mongodb";
import ResourceSubmission from "@/models/ResourceSubmission";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

/* ================= PATCH ================= */

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await authorizeAdminApi(req, {
    roles: ["owner", "admin"],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  await connectDB();

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
}
