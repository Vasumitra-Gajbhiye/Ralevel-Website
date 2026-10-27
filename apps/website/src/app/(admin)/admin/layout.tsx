import { canEnterAdmin, canOpenAdminPath, sectionsForRoles } from "@/lib/admin-access/resolve";
import { getAdminSection, matchAdminSection } from "@/lib/admin-access/sections";
import { getAdminAccessMap } from "@/lib/admin-access/server";
import { getAuthSession } from "@/lib/getAuthSession";
import NoAccess from "@/components/NoAccess";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import AdminLayoutShell from "./AdminLayoutShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();
  const roles = session?.userData?.roles ?? [];
  const accessMap = await getAdminAccessMap();

  if (!session || !canEnterAdmin(accessMap, roles)) {
    redirect("/");
  }

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  // Without a pathname, leave the decision to the page's own guardSection.
  const allowed = !pathname || canOpenAdminPath(accessMap, roles, pathname);
  const section = matchAdminSection(pathname);

  const nav = sectionsForRoles(accessMap, roles).flatMap(
    (key) => getAdminSection(key).nav,
  );

  return (
    <AdminLayoutShell nav={nav}>
      {allowed ? (
        children
      ) : (
        <NoAccess
          message={
            section
              ? `You don't have access to ${section.label}.`
              : "You don't have permission to access this page."
          }
        />
      )}
    </AdminLayoutShell>
  );
}
