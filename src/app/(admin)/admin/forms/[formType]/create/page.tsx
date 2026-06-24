import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import CreateForm from "./CreateForm";
export default async function CreateFormPage({
  params,
}: {
  params: Promise<{ formType: string }>;
}) {
  const { formType } = await params;

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

      <CreateForm formType={formType} />
    </div>
  );
}
