import { getAuthSession } from "@/lib/getAuthSession";
import connectDB from "@/lib/mongodb";
import {
  buildPaginatedResponse,
  parsePaginationParams,
} from "@/lib/pagination";
import { canManageFormType } from "@/lib/roles";
import Form from "@/models/Form";
import FormClient from "./formClient";

export default async function AdminFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ formType: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { formType } = await params;
  const queryParams = await searchParams;
  const session = await getAuthSession();
  const canManage = canManageFormType(session?.userData?.roles, formType);

  await connectDB();

  const { page, limit, skip } = parsePaginationParams(
    new URLSearchParams({ page: queryParams.page ?? "1" }),
  );

  const [forms, total] = await Promise.all([
    Form.find({ formType })
      .sort({ cycleId: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Form.countDocuments({ formType }),
  ]);

  const pagination = buildPaginatedResponse(
    forms,
    total,
    page,
    limit,
  ).pagination;

  return (
    <FormClient
      forms={JSON.parse(JSON.stringify(forms))}
      formType={formType}
      pagination={pagination}
      canManage={canManage}
    />
  );
}
