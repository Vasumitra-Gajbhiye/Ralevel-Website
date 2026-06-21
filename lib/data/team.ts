import { cachedQuery } from "@/lib/data-cache";
import connectDB from "@/lib/mongodb";
import { buildPaginatedResponse } from "@/lib/pagination";
import { redisCached } from "@/lib/redis-cache";
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

type TeamListOptions = {
  page?: number;
  limit?: number;
};

function sortTeam(members: TeamMember[]): TeamMember[] {
  return [...members].sort((a, b) => {
    const orderA = roleOrder[a.title] ?? 99;
    const orderB = roleOrder[b.title] ?? 99;
    return orderA - orderB;
  });
}

async function fetchAllTeamMembers(): Promise<TeamMember[]> {
  await connectDB();
  return TeamData.find()
    .select("name title discordId linkedin imgSrc")
    .lean<TeamMember[]>();
}

export async function getCachedTeamMembers(): Promise<TeamMember[]> {
  const members = await redisCached(
    "team:members:all",
    () =>
      cachedQuery(
        ["team", "members"],
        fetchAllTeamMembers,
        { revalidate: 600, tags: ["team"] }
      ),
    { ttlSec: 600, tags: ["team"] }
  );

  return sortTeam(members);
}

export async function getCachedTeamList(options: TeamListOptions = {}) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 50;
  const skip = (page - 1) * limit;

  return redisCached(
    `team:list:${page}:${limit}`,
    async () => {
      await connectDB();
      const [data, total] = await Promise.all([
        TeamData.find()
          .select("name title discordId")
          .sort({ _id: 1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        TeamData.countDocuments(),
      ]);
      return { data, total, page, limit };
    },
    { ttlSec: 600, tags: ["team"] }
  );
}

export async function getPaginatedTeamList(options: TeamListOptions = {}) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 50;
  const result = await getCachedTeamList({ page, limit });
  return buildPaginatedResponse(result.data, result.total, page, limit);
}
