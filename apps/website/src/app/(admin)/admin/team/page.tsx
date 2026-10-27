import { guardSection } from "@/lib/admin-access/page-guard";
import { getAdminTeamMembers } from "@/lib/data/admin/team";
import TeamAdminClient from "./TeamAdminClient";

export default async function AdminTeamPage() {
  const denied = await guardSection("team");
  if (denied) return denied;

  const members = await getAdminTeamMembers();
  return <TeamAdminClient initialMembers={members} />;
}
