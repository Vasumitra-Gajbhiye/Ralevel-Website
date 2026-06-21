import connectDB from "@/lib/mongodb";
import {
  buildPaginatedResponse,
  parsePaginationParams,
} from "@/lib/pagination";
import Form from "@/models/Form";
import FormSubmission from "@/models/FormSubmission";
import { FormDocument } from "@/types/form";
import { notFound } from "next/navigation";
import AdminFormPageClient from "./pageClient";

export default async function AdminFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const queryParams = await searchParams;
  await connectDB();

  const form = (await Form.findOne({
    slug: slug,
  }).lean()) as FormDocument | null;

  if (!form) notFound();

  const { page, limit, skip } = parsePaginationParams(
    new URLSearchParams({ page: queryParams.page ?? "1" })
  );

  const [totalResponses, submissions, summarySubmissions] = await Promise.all([
    FormSubmission.countDocuments({ formSlug: slug }),
    FormSubmission.find(
      { formSlug: slug },
      { responses: 1, createdAt: 1, status: 1, formType: 1, votes: 1 }
    )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    FormSubmission.find({ formSlug: slug }, { votes: 1, createdAt: 1 }).lean(),
  ]);

  const pagination = buildPaginatedResponse(
    submissions,
    totalResponses,
    page,
    limit
  ).pagination;

  const plainSubmissions = JSON.parse(JSON.stringify(submissions));
  const plainSummarySubmissions = JSON.parse(JSON.stringify(summarySubmissions));
  const plainForm = JSON.parse(JSON.stringify(form));

  return (
    <AdminFormPageClient
      form={plainForm}
      totalResponses={totalResponses}
      submissions={plainSubmissions}
      summarySubmissions={plainSummarySubmissions}
      pagination={pagination}
    />
  );
}
