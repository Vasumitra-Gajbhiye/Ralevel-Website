"use client";

import TeamAccessClient, { type TeamRoleMeta } from "@/components/admin/TeamAccessClient";
import type { TeamAccessUser } from "@/lib/data/admin/team-access";
import type { PaginationMeta } from "@/lib/pagination";
import { SCHOLARSHIP_TEAM_ROLES, type ScholarshipTeamRole } from "@/lib/roles";
import type { AuthSession } from "@/types/auth";
import { Shield, UserCog } from "lucide-react";

const LABELS: Record<ScholarshipTeamRole, string> = {
  scholarship_dep_head: "Scholarship Dep. Head",
  scholarship_staff: "Scholarship Staff",
};

const META: Record<ScholarshipTeamRole, TeamRoleMeta> = {
  scholarship_dep_head: {
    color: "bg-sky-100 text-sky-800 border-sky-200",
    icon: Shield,
  },
  scholarship_staff: {
    color: "bg-cyan-100 text-cyan-800 border-cyan-200",
    icon: UserCog,
  },
};

export default function ScholarshipTeamClient({
  session,
  initialUsers,
  pagination,
}: {
  session: AuthSession | null;
  initialUsers: TeamAccessUser<ScholarshipTeamRole>[];
  pagination: PaginationMeta;
}) {
  return (
    <TeamAccessClient
      title="Scholarship team"
      description="Who can manage scholarships and universities"
      noun="scholarship"
      apiBase="/api/admin/scholarship-access"
      pagePath="/admin/scholarships/team"
      teamRoles={SCHOLARSHIP_TEAM_ROLES}
      depHeadRole="scholarship_dep_head"
      staffRole="scholarship_staff"
      labels={LABELS}
      meta={META}
      session={session}
      initialUsers={initialUsers}
      pagination={pagination}
    />
  );
}
