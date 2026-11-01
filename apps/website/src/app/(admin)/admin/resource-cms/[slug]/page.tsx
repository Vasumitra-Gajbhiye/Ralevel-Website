import { guardSection } from "@/lib/admin-access/page-guard";
import { getAdminResourceEditorData } from "@/lib/data/admin/resource-cms";
import { getOpenChangeRequest } from "@/lib/data/admin/resource-change-requests";
import { getAuthSession } from "@/lib/getAuthSession";
import { viewerFromSession } from "@/lib/resource-cms/requests/route";
import { notFound } from "next/navigation";
import ResourceEditorClient from "./ResourceEditorClient";

export default async function ResourceEditorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const denied = await guardSection("resource-cms");
  if (denied) return denied;

  const { slug } = await params;
  const [data, openRequest, session] = await Promise.all([
    getAdminResourceEditorData(slug),
    getOpenChangeRequest(slug),
    getAuthSession(),
  ]);

  if (!data || !session) {
    notFound();
  }

  return (
    <ResourceEditorClient
      initialData={data}
      openRequest={openRequest}
      viewer={await viewerFromSession(session)}
    />
  );
}
