import { enforceSameOrigin } from "@/lib/csrf";
import { getAuthSession } from "@/lib/getAuthSession";
import connectDB from "@/lib/mongodb";
import { enforceRateLimit } from "@/lib/rateLimit";
import { firstIssue, submissionInputSchema } from "@/lib/validation/scholarships";
import Scholarship from "@/models/scholarship";
import ScholarshipSubmission from "@/models/scholarshipSubmission";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to suggest a scholarship" }, { status: 401 });
  }

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  const rlError = await enforceRateLimit(
    req,
    "scholarship-submit",
    { limit: 3, windowSec: 10 * 60 },
    session.userId,
  );
  if (rlError) return rlError;

  const parsed = submissionInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }
  const input = parsed.data;

  await connectDB();
  if (input.kind === "correction") {
    const exists = await Scholarship.exists({ _id: input.scholarshipId });
    if (!exists) return NextResponse.json({ error: "Scholarship not found" }, { status: 404 });
  }

  await ScholarshipSubmission.create({
    ...input,
    submittedBy: { userId: session.userId, email: session.user.email },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
