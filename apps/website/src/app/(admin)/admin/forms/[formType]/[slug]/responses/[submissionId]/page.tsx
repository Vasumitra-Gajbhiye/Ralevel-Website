import connectDB from "@/lib/mongodb";
import {
  resolveDecisionEmailTemplates,
  type DecisionEmailTemplates,
} from "@/lib/emails/decisionEmail";
import { canVoteOnForm } from "@/lib/forms/incharge";
import { getAuthSession } from "@/lib/getAuthSession";
import Form from "@/models/Form";
import FormIndex from "@/models/FormIndex";
import FormSubmission from "@/models/FormSubmission";
import { FormDocument } from "@/types/form";
import { notFound } from "next/navigation";
import SubmissionPageClient from "./pageClient";

export default async function SubmissionPage({
  params,
}: {
  params: Promise<{ slug: string; submissionId: string }>;
}) {
  const { slug, submissionId } = await params;

  await connectDB();

  const form = (await Form.findOne({ slug }).lean()) as FormDocument | null;

  if (!form) notFound();

  const submission = await FormSubmission.findOne({
    _id: submissionId,
    formSlug: slug,
  }).lean();

  if (!submission) notFound();

  const session = await getAuthSession();
  const canVote = session
    ? await canVoteOnForm({
        roles: session.userData?.roles,
        email: session.user?.email,
        form: {
          inchargeNicknames: form.inchargeNicknames ?? [],
          formType: form.formType,
        },
      })
    : false;

  const formIndex = await FormIndex.findOne({ slug: form.formType })
    .select("decisionEmails")
    .lean();

  const decisionEmailTemplates = resolveDecisionEmailTemplates(
    (formIndex as { decisionEmails?: Partial<DecisionEmailTemplates> } | null)
      ?.decisionEmails,
  );

  const plainForm = JSON.parse(JSON.stringify(form));
  const plainSubmission = JSON.parse(JSON.stringify(submission));

  return (
    <SubmissionPageClient
      form={plainForm}
      submission={plainSubmission}
      canVote={canVote}
      decisionEmailTemplates={decisionEmailTemplates}
    />
  );
}
