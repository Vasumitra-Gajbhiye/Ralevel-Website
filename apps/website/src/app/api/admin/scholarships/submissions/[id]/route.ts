import connectDB from "@/lib/mongodb";
import { authorizeScholarshipAdmin, jsonError } from "@/lib/scholarships/adminApi";
import { saveScholarship } from "@/lib/scholarships/mutations";
import { emptyScholarshipInput, isHttpUrl } from "@/lib/validation/scholarships";
import ScholarshipSubmission from "@/models/scholarshipSubmission";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

type Context = { params: Promise<{ id: string }> };

type SubmissionDoc = {
  _id: mongoose.Types.ObjectId;
  kind: "new" | "correction";
  scholarshipId?: mongoose.Types.ObjectId;
  title: string;
  url?: string;
  deadline?: string;
  notes?: string;
  status: string;
};

/**
 * { action: "create-draft" } — new: creates a pre-filled draft; correction:
 *   resolves it. Returns the scholarship id to open in the editor.
 * { action: "dismiss", note? }
 */
export async function PATCH(req: Request, context: Context) {
  const auth = await authorizeScholarshipAdmin(req, { write: true });
  if (auth instanceof Response) return auth;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return jsonError("Invalid id");

  const body = (await req.json()) as { action?: unknown; note?: unknown };
  await connectDB();
  const submission = await ScholarshipSubmission.findById(id).lean<SubmissionDoc | null>();
  if (!submission) return jsonError("Submission not found", 404);
  if (submission.status !== "pending") return jsonError("Already handled", 409);

  if (body.action === "dismiss") {
    const note = typeof body.note === "string" ? body.note.trim().slice(0, 500) : "";
    await ScholarshipSubmission.updateOne(
      { _id: id },
      { $set: { status: "rejected", adminNotes: note } },
    );
    return NextResponse.json({ success: true });
  }

  if (body.action !== "create-draft") return jsonError("Unknown action");

  if (submission.kind === "correction") {
    await ScholarshipSubmission.updateOne({ _id: id }, { $set: { status: "approved" } });
    return NextResponse.json({ data: { scholarshipId: String(submission.scholarshipId) } });
  }

  const url = submission.url && isHttpUrl(submission.url) ? submission.url : "";
  const result = await saveScholarship(
    {
      ...emptyScholarshipInput(),
      title: submission.title.slice(0, 160),
      provider: "Unknown provider",
      officialUrl: url,
      deadlineNote: (submission.deadline ?? "").slice(0, 160),
      description: submission.notes ?? "",
    },
    auth,
    { source: "community", needsVerification: true },
  );
  if (!result.ok) return jsonError(result.error, result.status);

  await ScholarshipSubmission.updateOne(
    { _id: id },
    { $set: { status: "approved", createdScholarshipId: result.id } },
  );
  return NextResponse.json({ data: { scholarshipId: result.id } });
}
