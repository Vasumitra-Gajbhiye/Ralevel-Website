import connectDB from "@/lib/mongodb";
import FormIndex from "@/models/FormIndex";
import { notFound } from "next/navigation";
import ResourceFormPageClient from "./pageClient";

export const dynamic = "force-dynamic";

export default async function ResourceFormPage() {
  await connectDB();

  const form = await FormIndex.findOne({ slug: "resource" }).lean();

  if (!form) {
    notFound();
  }

  // serialize for client component
  const plainForm = JSON.parse(JSON.stringify(form));

  if (plainForm.status !== "open") {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold mb-3">Submissions Closed</h1>
        <p className="text-muted-foreground">
          The resource submission form is currently closed. Please check back
          later.
        </p>
      </div>
    );
  }

  return <ResourceFormPageClient />;
}
