import {
  getAdminSectionMessage,
  getAdminSectionRoles,
} from "@/lib/adminAccess";
import { getAuthSession } from "@/lib/getAuthSession";
import { canAccessAdminPanel, hasRequiredRole } from "@/lib/roles";
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

  if (!session || !canAccessAdminPanel(session.userData?.roles)) {
    redirect("/"); // or redirect
  }

  const roles = session.userData?.roles;

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const sectionRoles = getAdminSectionRoles(pathname);
  const sectionDenied = sectionRoles && !hasRequiredRole(roles, sectionRoles);

  // ❌ Logged in but NO ROLES
  if (!roles || roles.length === 0) {
    return (
      <AdminLayoutShell roles={[]}>
        <NoAccess message="You don’t have access to the admin panel." />
      </AdminLayoutShell>
    );
  }

  return (
    <AdminLayoutShell roles={roles}>
      {sectionDenied ? (
        <NoAccess
          message={
            getAdminSectionMessage(pathname) ??
            "You don't have permission to access this page."
          }
        />
      ) : (
        children
      )}
    </AdminLayoutShell>
  );
}
