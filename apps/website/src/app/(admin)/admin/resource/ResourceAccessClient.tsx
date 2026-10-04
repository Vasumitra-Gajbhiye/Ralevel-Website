"use client";

import TeamAccessClient, {
  type TeamRoleMeta,
} from "@/components/admin/TeamAccessClient";
import type { ResourceAccessUser } from "@/lib/data/admin/resource-access";
import type { PaginationMeta } from "@/lib/pagination";
import { RESOURCE_TEAM_ROLES, type ResourceTeamRole } from "@/lib/roles";
import type { AuthSession } from "@/types/auth";
import { Shield, UserCog } from "lucide-react";

const RESOURCE_ROLE_LABELS: Record<ResourceTeamRole, string> = {
  resource_dep_head: "Resource Dep. Head",
  resource_staff: "Resource Staff",
};

const RESOURCE_ROLE_META: Record<ResourceTeamRole, TeamRoleMeta> = {
  resource_dep_head: {
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Shield,
  },
  resource_staff: {
    color: "bg-teal-100 text-teal-800 border-teal-200",
    icon: UserCog,
  },
};

export default function ResourceAccessClient({
  session,
  initialUsers,
  pagination,
}: {
  session: AuthSession | null;
  initialUsers: ResourceAccessUser[];
  pagination: PaginationMeta;
}) {
  return (
    <TeamAccessClient
      title="Resource Dept."
      description="Manage Resource CMS access for department heads and staff"
      noun="resource"
      apiBase="/api/admin/resource-access"
      pagePath="/admin/resource"
      teamRoles={RESOURCE_TEAM_ROLES}
      depHeadRole="resource_dep_head"
      staffRole="resource_staff"
      labels={RESOURCE_ROLE_LABELS}
      meta={RESOURCE_ROLE_META}
      session={session}
      initialUsers={initialUsers}
      pagination={pagination}
    />
  );
}
