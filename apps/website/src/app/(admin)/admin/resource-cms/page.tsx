import { guardSection } from "@/lib/admin-access/page-guard";
import { getAdminResourceSubjectsList } from "@/lib/data/admin/resource-cms";
import {
  countRequestsNeedingReview,
  getOpenRequestStatuses,
  listMyOpenRequests,
} from "@/lib/data/admin/resource-change-requests";
import { getAuthSession } from "@/lib/getAuthSession";
import { parsePaginationParams } from "@/lib/pagination";
import { canPublishResources } from "@/lib/resource-cms/access";
import ResourceCMSClient from "./ResourceCMSClient";

export default async function ResourceCMSPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const denied = await guardSection("resource-cms");
  if (denied) return denied;

  const params = await searchParams;
  const { page, limit, skip } = parsePaginationParams(
    new URLSearchParams({ page: params.page ?? "1" })
  );

  const [{ data, pagination }, session] = await Promise.all([
    getAdminResourceSubjectsList({ page, limit, skip }),
    getAuthSession(),
  ]);
  const canPublish = await canPublishResources(session?.userData.roles);

  const [openBySlug, needsReview, myRequests] = await Promise.all([
    getOpenRequestStatuses(data.map((subject) => subject.slug)),
    canPublish ? countRequestsNeedingReview() : Promise.resolve(0),
    !canPublish && session ? listMyOpenRequests(session.userData.id) : Promise.resolve([]),
  ]);
  const subjects = data.map((subject) => ({
    ...subject,
    openRequest: openBySlug[subject.slug] ?? null,
  }));

  return (
    <ResourceCMSClient
      initialSubjects={subjects}
      pagination={pagination}
      canEditHomepage={canPublish}
      needsReview={needsReview}
      myRequests={myRequests}
    />
  );
}
