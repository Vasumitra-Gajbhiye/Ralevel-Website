import { enforceSameOrigin } from "@/lib/csrf";
import {
  resolveDecisionEmailTemplates,
  type DecisionEmailTemplate,
  type DecisionEmailTemplates,
} from "@/lib/emails/decisionEmail";
import { getAuthSession } from "@/lib/getAuthSession";
import connectDB from "@/lib/mongodb";
import { canManageFormType, type Role } from "@/lib/roles";
import FormIndex from "@/models/FormIndex";
import { NextResponse } from "next/server";

function isTemplate(value: unknown): value is DecisionEmailTemplate {
  if (!value || typeof value !== "object") return false;
  const t = value as Record<string, unknown>;
  return typeof t.subject === "string" && typeof t.body === "string";
}

export async function GET(req: Request) {
  const session = await getAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const formType = searchParams.get("formType")?.trim();
  if (!formType) {
    return NextResponse.json({ error: "formType is required" }, { status: 400 });
  }

  await connectDB();

  const index = await FormIndex.findOne({ slug: formType })
    .select("decisionEmails slug")
    .lean();

  if (!index) {
    return NextResponse.json({ error: "Form type not found" }, { status: 404 });
  }

  const templates = resolveDecisionEmailTemplates(
    (index as { decisionEmails?: Partial<DecisionEmailTemplates> }).decisionEmails,
  );

  return NextResponse.json({ formType, templates });
}

export async function PATCH(req: Request) {
  const session = await getAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  const body = await req.json();
  const formType =
    typeof body.formType === "string" ? body.formType.trim() : "";

  if (!formType) {
    return NextResponse.json({ error: "formType is required" }, { status: 400 });
  }

  if (!canManageFormType(session.userData?.roles as Role[] | undefined, formType)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isTemplate(body.accepted) || !isTemplate(body.rejected)) {
    return NextResponse.json(
      { error: "accepted and rejected templates with subject and body are required" },
      { status: 400 },
    );
  }

  const accepted: DecisionEmailTemplate = {
    subject: body.accepted.subject.trim(),
    body: body.accepted.body.trim(),
  };
  const rejected: DecisionEmailTemplate = {
    subject: body.rejected.subject.trim(),
    body: body.rejected.body.trim(),
  };

  if (!accepted.subject || !accepted.body || !rejected.subject || !rejected.body) {
    return NextResponse.json(
      { error: "Subject and body cannot be empty" },
      { status: 400 },
    );
  }

  await connectDB();

  const updated = await FormIndex.findOneAndUpdate(
    { slug: formType },
    {
      $set: {
        decisionEmails: { accepted, rejected },
      },
    },
    { new: true },
  )
    .select("decisionEmails slug")
    .lean();

  if (!updated) {
    return NextResponse.json({ error: "Form type not found" }, { status: 404 });
  }

  const templates = resolveDecisionEmailTemplates(
    (updated as { decisionEmails?: Partial<DecisionEmailTemplates> }).decisionEmails,
  );

  return NextResponse.json({ success: true, formType, templates });
}
