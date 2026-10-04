import { enforceSameOrigin } from "@/lib/csrf";
import {
  addSave,
  getSavedScholarships,
  removeSave,
  updateSave,
} from "@/lib/data/scholarship-saves";
import { getAuthSession } from "@/lib/getAuthSession";
import { enforceRateLimit } from "@/lib/rateLimit";
import { isOneOf, TRACKER_STATUSES } from "@/lib/scholarships/constants";
import type { AuthSession } from "@/types/auth";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

const MAX_REQUIREMENT_IDS = 50;

async function authorize(
  req: Request,
  write: boolean,
): Promise<AuthSession | Response> {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to save scholarships" }, { status: 401 });
  }
  if (write) {
    const csrfError = enforceSameOrigin(req);
    if (csrfError) return csrfError;
  }
  const rlError = await enforceRateLimit(
    req,
    "scholarship-saves",
    { limit: 60, windowSec: 60 },
    session.userId,
  );
  if (rlError) return rlError;
  return session;
}

async function readScholarshipId(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const id = typeof body.scholarshipId === "string" ? body.scholarshipId : "";
  return { body, id: mongoose.Types.ObjectId.isValid(id) ? id : null };
}

export async function GET(req: Request) {
  const session = await authorize(req, false);
  if (session instanceof Response) return session;
  return NextResponse.json({ data: await getSavedScholarships(session.userData.id) });
}

export async function POST(req: Request) {
  const session = await authorize(req, true);
  if (session instanceof Response) return session;

  const { id } = await readScholarshipId(req);
  if (!id) return NextResponse.json({ error: "Invalid scholarship" }, { status: 400 });

  const state = await addSave(session.userData.id, id);
  if (!state) return NextResponse.json({ error: "Scholarship not found" }, { status: 404 });
  return NextResponse.json({ data: state });
}

export async function PATCH(req: Request) {
  const session = await authorize(req, true);
  if (session instanceof Response) return session;

  const { body, id } = await readScholarshipId(req);
  if (!id) return NextResponse.json({ error: "Invalid scholarship" }, { status: 400 });

  const patch: Parameters<typeof updateSave>[2] = {};
  if (body.status !== undefined) {
    if (!isOneOf(TRACKER_STATUSES, body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    patch.status = body.status;
  }
  if (body.completedRequirementIds !== undefined) {
    if (!Array.isArray(body.completedRequirementIds)) {
      return NextResponse.json({ error: "Invalid checklist" }, { status: 400 });
    }
    patch.completedRequirementIds = [
      ...new Set(
        body.completedRequirementIds.filter(
          (v): v is string => typeof v === "string" && mongoose.Types.ObjectId.isValid(v),
        ),
      ),
    ].slice(0, MAX_REQUIREMENT_IDS);
  }

  const state = await updateSave(session.userData.id, id, patch);
  if (!state) return NextResponse.json({ error: "Not saved" }, { status: 404 });
  return NextResponse.json({ data: state });
}

export async function DELETE(req: Request) {
  const session = await authorize(req, true);
  if (session instanceof Response) return session;

  const { id } = await readScholarshipId(req);
  if (!id) return NextResponse.json({ error: "Invalid scholarship" }, { status: 400 });

  await removeSave(session.userData.id, id);
  return NextResponse.json({ success: true });
}
