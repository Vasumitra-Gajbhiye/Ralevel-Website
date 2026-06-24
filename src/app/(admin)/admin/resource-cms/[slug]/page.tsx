import { getAdminResourceEditorData } from "@/lib/data/admin/resource-cms";
import { notFound } from "next/navigation";
import ResourceEditorClient from "./ResourceEditorClient";

export default async function ResourceEditorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getAdminResourceEditorData(slug);

  if (!data) {
    notFound();
  }

  return <ResourceEditorClient initialData={data} />;
}
