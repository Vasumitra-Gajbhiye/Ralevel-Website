import { canVoteOnForm } from "@/lib/forms/incharge";
import { enforceSameOrigin } from "@/lib/csrf";
import { getAuthSession } from "@/lib/getAuthSession";
import connectDB from "@/lib/mongodb";
import Form from "@/models/Form";
import FormSubmission from "@/models/FormSubmission";
import type { Role } from "@/lib/roles";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  await connectDB();

  const session = await getAuthSession();

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  const { submissionId, vote } = await req.json();

  if (!submissionId || ![1, -1].includes(vote)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const submission = await FormSubmission.findById(submissionId);

  if (!submission) {
    return NextResponse.json(
      { error: "Submission not found" },
      { status: 404 },
    );
  }

  const form = (await Form.findOne({ slug: submission.formSlug })
    .select("inchargeNicknames")
    .lean()) as { inchargeNicknames?: string[] } | null;
  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  const allowed = await canVoteOnForm({
    roles: session.userData?.roles as Role[] | undefined,
    email: session.user.email,
    form: { inchargeNicknames: form.inchargeNicknames ?? [] },
  });

  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const adminId = session.user.email;
  const adminName = session.user.name || session.user.email;

  const existingVoteIndex = submission.votes.findIndex(
    (v: { adminId: string }) => v.adminId === adminId,
  );

  if (existingVoteIndex === -1) {
    submission.votes.push({
      adminId,
      adminName,
      vote,
      votedAt: new Date(),
    });
  } else {
    submission.votes[existingVoteIndex].vote = vote;
    submission.votes[existingVoteIndex].votedAt = new Date();
    submission.votes[existingVoteIndex].adminName = adminName;
  }

  await submission.save();

  const upvotes = submission.votes.filter((v: { vote: number }) => v.vote === 1)
    .length;
  const downvotes = submission.votes.filter(
    (v: { vote: number }) => v.vote === -1,
  ).length;

  return NextResponse.json({
    success: true,
    votes: submission.votes,
    upvotes,
    downvotes,
    currentAdminVote: vote,
    adminId,
  });
}
