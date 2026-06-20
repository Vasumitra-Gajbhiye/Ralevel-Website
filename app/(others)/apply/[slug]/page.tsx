import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Form from "@/models/Form";
import { FormDocument } from "@/types/form";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import LoginRequiredCard from "./components/LoginRequiredCard";
import FormPageClient from "./pageClient";

export default async function FormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  await connectDB();

  const form = (await Form.findOne({ slug }).lean()) as FormDocument | null;
  const session = await getServerSession(authOptions);

  if (!form) {
    notFound();
  }

  if (!session) {
    return <LoginRequiredCard />;
  }

  if (form.status !== "open") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <h1 className="text-2xl font-semibold">Applications Closed</h1>
        <p className="mt-2 text-muted-foreground">
          This form is not currently accepting submissions.
        </p>
      </div>
    );
  }

  const plainForm = JSON.parse(JSON.stringify(form));

  return <FormPageClient form={plainForm} />;
}
