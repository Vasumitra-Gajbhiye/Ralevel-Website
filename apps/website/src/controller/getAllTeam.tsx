import { getCachedTeamMembers, type TeamMember } from "@/lib/data/team";

export default async function getAllTeam(): Promise<TeamMember[]> {
  try {
    return await getCachedTeamMembers();
  } catch (error) {
    console.log(error);
    return [];
  }
}
