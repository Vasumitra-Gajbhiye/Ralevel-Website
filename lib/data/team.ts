import { cachedQuery } from "@/lib/data-cache";
import connectDB from "@/lib/mongodb";
import TeamData from "@/models/teamData";

export type TeamMember = {
  name: string;
  title: string;
  discordId: string;
  linkedin?: string;
  imgSrc?: string;
};

const roleOrder: Record<string, number> = {
  "Community Leader": 1,
  "Chief Administrator": 2,
  Administrator: 3,
  "Sr. Moderator": 4,
  "Jr. Moderator": 5,
};

function sortTeam(members: TeamMember[]): TeamMember[] {
  return [...members].sort((a, b) => {
    const orderA = roleOrder[a.title] ?? 99;
    const orderB = roleOrder[b.title] ?? 99;
    return orderA - orderB;
  });
}

export async function getCachedTeamMembers(): Promise<TeamMember[]> {
  const members = await cachedQuery(
    ["team", "members"],
    async () => {
      await connectDB();
      return TeamData.find()
        .select("name title discordId linkedin imgSrc")
        .lean<TeamMember[]>();
    },
    { revalidate: 600, tags: ["team"] }
  );

  return sortTeam(members);
}
