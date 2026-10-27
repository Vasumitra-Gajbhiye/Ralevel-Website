import { guardSection } from "@/lib/admin-access/page-guard";
import {
  ADMIN_SECTIONS,
  isAdminSectionKey,
} from "@/lib/admin-access/sections";
import { getPermissionsPageData } from "@/lib/data/admin/permissions";
import { getAuthSession } from "@/lib/getAuthSession";
import { STAFF_ROLES, type Role } from "@/lib/roles";
import PermissionsClient from "./PermissionsClient";

export const metadata = {
  title: "Page access · Admin",
  robots: { index: false, follow: false },
};

export default async function PermissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; role?: string; page?: string }>;
}) {
  const denied = await guardSection("permissions");
  if (denied) return denied;

  const [session, params, data] = await Promise.all([
    getAuthSession(),
    searchParams,
    getPermissionsPageData(),
  ]);

  const role = STAFF_ROLES.find((r) => r === params.role) ?? ("admin" as Role);
  const section = isAdminSectionKey(params.page) ? params.page : ADMIN_SECTIONS[0].key;

  return (
    <PermissionsClient
      initial={data}
      actorRoles={session?.userData.roles ?? []}
      initialView={params.view === "page" ? "page" : "role"}
      initialRole={role}
      initialSection={section}
    />
  );
}
