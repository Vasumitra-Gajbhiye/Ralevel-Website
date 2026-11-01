import { guardSection } from "@/lib/admin-access/page-guard";
import { getChangeRequestDetail } from "@/lib/data/admin/resource-change-requests";
import { getAuthSession } from "@/lib/getAuthSession";
import { parseRequestNumber, viewerFromSession } from "@/lib/resource-cms/requests/route";
import { notFound } from "next/navigation";
import RequestDetailClient from "./RequestDetailClient";

export default async function ResourceChangeRequestPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const denied = await guardSection("resource-cms");
  if (denied) return denied;

  const number = parseRequestNumber((await params).number);
  if (!number) notFound();

  const [detail, session] = await Promise.all([
    getChangeRequestDetail(number),
    getAuthSession(),
  ]);
  if (!detail || !session) notFound();

  return <RequestDetailClient request={detail} viewer={await viewerFromSession(session)} />;
}
