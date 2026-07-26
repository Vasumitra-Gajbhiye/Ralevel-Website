import NoAccess from "@/components/NoAccess";
import { getAuthSession } from "@/lib/getAuthSession";
import connectDB from "@/lib/mongodb";
import { canManageFormType } from "@/lib/roles";
import Form from "@/models/Form";
import FormIndex from "@/models/FormIndex";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import CreateForm from "./CreateForm";

export default async function CreateFormPage({
  params,
}: {
  params: Promise<{ formType: string }>;
}) {
  const { formType } = await params;
  const session = await getAuthSession();

  if (!canManageFormType(session?.userData?.roles, formType)) {
    return (
      <NoAccess message="You don't have permission to create form cycles for this form type." />
    );
  }

  await connectDB();

  const [previousCycles, formIndex, latestForm] = await Promise.all([
    Form.find({ formType })
      .sort({ cycleId: -1 })
      .select("cycleId title slug status")
      .lean(),
    FormIndex.findOne({ slug: formType }).select("activeCycleId").lean(),
    Form.findOne({ formType }).sort({ cycleId: -1 }).select("cycleId").lean(),
  ]);

  const activeCycleId =
    formIndex && !Array.isArray(formIndex)
      ? (formIndex.activeCycleId as number | undefined)
      : undefined;
  const latestCycleId =
    latestForm && !Array.isArray(latestForm)
      ? (latestForm.cycleId as number | undefined)
      : undefined;

  const nextCycleId = (activeCycleId ?? latestCycleId ?? 0) + 1;

  return (
    <div className="max-w-5xl space-y-6">
      <Link
        href={`/admin/forms/${formType}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to forms
      </Link>
      <div>
        <h1 className="text-2xl font-semibold">
          Create New Cycle — {formType}
        </h1>
        <p className="text-sm text-muted-foreground">
          This form will be locked after creation. Content cannot be edited
          later.
        </p>
      </div>

      <CreateForm
        formType={formType}
        nextCycleId={nextCycleId}
        previousCycles={JSON.parse(JSON.stringify(previousCycles))}
      />
    </div>
  );
}
