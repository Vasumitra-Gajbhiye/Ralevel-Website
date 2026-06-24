// import connectDB from "@/libs/mongodb";
// import Form from "@/models/Form";
// import { FormDocument } from "@/types/form";
// import { notFound } from "next/navigation";
// import { mockWriterSubmissions } from "../../_mockSubmissions";
// import SubmissionPageClient from "./pageClient";
// export default async function SubmissionPage({
//   params,
// }: {
//   params: Promise<{ slug: string; submissionId: string }>;
// }) {
//   const { slug, submissionId } = await params;

//   await connectDB();

//   const form = (await Form.findOne({ slug }).lean()) as FormDocument | null;

//   if (!form) {
//     notFound();
//   }

//   const submission = mockWriterSubmissions.find((s) => s.id === submissionId);

//   if (!submission) {
//     notFound();
//   }

//   const plainSubmission = JSON.parse(JSON.stringify(submission));
//   const plainForm = JSON.parse(JSON.stringify(form));

//   return <SubmissionPageClient submission={plainSubmission} form={plainForm} />;
// }

import connectDB from "@/lib/mongodb";
import Form from "@/models/Form";
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

  // 1️⃣ Fetch form
  const form = (await Form.findOne({ slug }).lean()) as FormDocument | null;

  if (!form) notFound();

  // 2️⃣ Fetch submission
  const submission = await FormSubmission.findOne({
    _id: submissionId,
    formSlug: slug,
  }).lean();

  if (!submission) notFound();

  // 3️⃣ Convert to plain objects
  const plainForm = JSON.parse(JSON.stringify(form));
  const plainSubmission = JSON.parse(JSON.stringify(submission));

  return <SubmissionPageClient form={plainForm} submission={plainSubmission} />;
}
