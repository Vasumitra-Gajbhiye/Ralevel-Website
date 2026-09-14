import { getAdminTeamMembers } from "@/lib/data/admin/team";
import TeamAdminClient from "./TeamAdminClient";

export default async function AdminTeamPage() {
  const members = await getAdminTeamMembers();
  return <TeamAdminClient initialMembers={members} />;
}
