import { getAuthSession } from "@/lib/getAuthSession";
import NoAccess from "@/components/NoAccess";
import { hasRequiredRole } from "@/lib/roles";
import React from "react";

export default async function SchedulingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  // No session at all → no access
  if (!session) {
    return <NoAccess message="You must be signed in to access this page." />;
  }

  // Multi-role support
  const roles = session.userData?.roles;

  // Role-based access
  const allowedRoles = ["owner", "admin", "writer"] as const;

  if (!hasRequiredRole(roles, allowedRoles)) {
    return (
      <NoAccess message="You don't have permission to access Blog records." />
    );
  }

  return <>{children}</>;
}
