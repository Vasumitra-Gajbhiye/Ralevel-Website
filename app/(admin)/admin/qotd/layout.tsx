import NoAccess from "@/components/NoAccess";
import { authOptions } from "@/lib/auth";
import { hasRequiredRole } from "@/lib/roles";
import { getServerSession } from "next-auth";
import React from "react";

export default async function qotdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // No session at all → no access
  if (!session) {
    return <NoAccess message="You must be signed in to access this page." />;
  }

  // Multi-role support
  const roles = session.userData?.roles;

  // Role-based access
  const allowedRoles = ["owner", "admin", "mod_dep_head"] as const;

  if (!hasRequiredRole(roles, allowedRoles)) {
    return (
      <NoAccess message="You don't have permission to access Informative Team records." />
    );
  }

  return <>{children}</>;
}
