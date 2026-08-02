import { canVoteOnForm } from "@/lib/forms/incharge";
import { resolveSubmitterEmail } from "@/lib/forms/submitterContact";
import { enforceSameOrigin } from "@/lib/csrf";
import {
  decisionEmailHtml,
  resolveDecisionEmailTemplates,
  stripIntakeSuffix,
  substituteDecisionVars,
  type DecisionEmailTemplates,
  type DecisionStatus,
} from "@/lib/emails/decisionEmail";
import { getAuthSession } from "@/lib/getAuthSession";
import connectDB from "@/lib/mongodb";
import type { Role } from "@/lib/roles";
import Form from "@/models/Form";
import FormIndex from "@/models/FormIndex";
import FormSubmission from "@/models/FormSubmission";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  await connectDB();

  const session = await getAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  const payload = await req.json();
  const submissionId =
    typeof payload.submissionId === "string" ? payload.submissionId.trim() : "";
  const decision = payload.decision as DecisionStatus;
  const subject =
    typeof payload.subject === "string" ? payload.subject.trim() : "";
  const body = typeof payload.body === "string" ? payload.body.trim() : "";

  if (!submissionId || !["accepted", "rejected"].includes(decision)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!subject || !body) {
    return NextResponse.json(
      { error: "Subject and body are required" },
      { status: 400 },
    );
  }

  const submission = await FormSubmission.findById(submissionId);
  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  if (submission.decision?.status) {
    return NextResponse.json(
      { error: "Decision already sent for this submission" },
      { status: 409 },
    );
  }

  const form = (await Form.findOne({ slug: submission.formSlug })
    .select("inchargeNicknames formType title cycleId sections")
    .lean()) as {
    inchargeNicknames?: string[];
    formType?: string;
    title?: string;
    cycleId?: number;
    sections?: Array<{
      id: string;
      fields?: Array<{ id: string; type?: string; label?: string }>;
    }>;
  } | null;

  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  const recipientEmail = resolveSubmitterEmail(
    {
      submitterEmail: submission.submitterEmail,
      responses: submission.responses as Record<
        string,
        Record<string, unknown>
      >,
    },
    form,
  );

  if (!recipientEmail) {
    return NextResponse.json(
      { error: "Submission has no email address" },
      { status: 400 },
    );
  }

  // Backfill for older submissions that never stored submitterEmail
  if (!submission.submitterEmail) {
    submission.submitterEmail = recipientEmail;
    await submission.save();
  }

  const allowed = await canVoteOnForm({
    roles: session.userData?.roles as Role[] | undefined,
    email: session.user.email,
    form: {
      inchargeNicknames: form.inchargeNicknames ?? [],
      formType: form.formType,
    },
  });

  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formType = form.formType || submission.formType;
  const index = await FormIndex.findOne({ slug: formType })
    .select("decisionEmails")
    .lean();

  const templates = resolveDecisionEmailTemplates(
    (index as { decisionEmails?: Partial<DecisionEmailTemplates> } | null)
      ?.decisionEmails,
  );

  const vars = {
    name: submission.submitterName,
    email: recipientEmail,
    formTitle: stripIntakeSuffix(form.title || "your application"),
    formType,
    cycle: form.cycleId ?? submission.cycleId,
  };

  const template = templates[decision];
  const templateSubject = substituteDecisionVars(template.subject, vars);
  const templateBody = substituteDecisionVars(template.body, vars);
  const wasPersonalized =
    subject !== templateSubject.trim() || body !== templateBody.trim();

  const html = decisionEmailHtml({ decision, body });

  try {
    const { error } = await resend.emails.send({
      from: "r/alevel <application@ralevel.com>",
      to: recipientEmail,
      subject,
      html,
    });

    if (error) {
      console.error("Decision email send failed:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error("Decision email send failed:", err);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 502 },
    );
  }

  const adminId = session.user.email;
  const adminName = session.user.name || session.user.email;
  const decisionRecord = {
    status: decision,
    sentAt: new Date(),
    sentByAdminId: adminId,
    sentByAdminName: adminName,
    email: {
      subject,
      body,
      wasPersonalized,
      templateSubject,
      templateBody,
    },
  };

  const updated = await FormSubmission.findOneAndUpdate(
    {
      _id: submissionId,
      $or: [{ decision: { $exists: false } }, { decision: null }],
    },
    { $set: { decision: decisionRecord } },
    { new: true },
  ).lean();

  if (!updated) {
    return NextResponse.json(
      { error: "Decision already sent for this submission" },
      { status: 409 },
    );
  }

  return NextResponse.json({
    success: true,
    decision: (updated as { decision?: unknown }).decision,
  });
}
