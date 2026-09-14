import { cachedQuery, revalidateDataTags } from "@/lib/data-cache";
import connectDB from "@/lib/mongodb";
import { buildPaginatedResponse } from "@/lib/pagination";
import { redisCached } from "@/lib/redis-cache";
import { TEAM_ROLE_TITLES } from "@/lib/team-constants";
import TeamData from "@/models/teamData";
import { Types } from "mongoose";

export type TeamMember = {
  name: string;
  title: string;
  discordId: string;
  linkedin?: string;
  imgSrc?: string;
  sortOrder?: number;
  showOnHomepage?: boolean;
};

const roleOrder: Record<string, number> = Object.fromEntries(
  TEAM_ROLE_TITLES.map((title, index) => [title, index + 1]),
);

const HOMEPAGE_FEATURED_ALIASES = [
  "vasumitra",
  "jake",
  "abu bakar",
  "haz",
  "hassan",
  "alen",
];

type TeamListOptions = {
  page?: number;
  limit?: number;
};

type TeamDoc = {
  _id: Types.ObjectId;
  name?: string;
  title?: string;
  discordId?: string;
  linkedin?: string;
  imgSrc?: string;
  sortOrder?: number;
  showOnHomepage?: boolean;
};

function roleRank(title: string): number {
  return roleOrder[title] ?? 99;
}

export function sortTeam<T extends { title: string; sortOrder?: number }>(
  members: T[],
): T[] {
  return [...members].sort((a, b) => {
    const orderA = a.sortOrder ?? roleRank(a.title) * 1000;
    const orderB = b.sortOrder ?? roleRank(b.title) * 1000;
    if (orderA !== orderB) return orderA - orderB;
    return a.title.localeCompare(b.title);
  });
}

function isFeaturedHomepageName(name?: string): boolean {
  const normalized = (name ?? "").trim().toLowerCase();
  return HOMEPAGE_FEATURED_ALIASES.some(
    (alias) => normalized === alias || normalized.startsWith(`${alias} `),
  );
}

export async function backfillTeamDefaults(): Promise<boolean> {
  await connectDB();
  const members = await TeamData.find().lean<TeamDoc[]>();
  if (members.length === 0) return false;

  const missingSort = members.filter((m) => typeof m.sortOrder !== "number");
  const missingHomepage = members.filter(
    (m) => typeof m.showOnHomepage !== "boolean",
  );
  const noneFeatured = members.every((m) => !m.showOnHomepage);
  if (
    missingSort.length === 0 &&
    missingHomepage.length === 0 &&
    !noneFeatured
  ) {
    return false;
  }

  const ops: {
    updateOne: {
      filter: { _id: Types.ObjectId };
      update: { $set: Record<string, number | boolean> };
    };
  }[] = [];

  if (missingSort.length > 0) {
    const maxExisting = members.reduce((max, member) => {
      return typeof member.sortOrder === "number"
        ? Math.max(max, member.sortOrder)
        : max;
    }, -1);
    const sortedMissing = sortTeam(
      missingSort.map((m) => ({ ...m, title: m.title ?? "" })),
    );
    sortedMissing.forEach((member, index) => {
      ops.push({
        updateOne: {
          filter: { _id: member._id },
          update: { $set: { sortOrder: maxExisting + 1 + index } },
        },
      });
    });
  }

  for (const member of missingHomepage) {
    const existing = ops.find(
      (op) => String(op.updateOne.filter._id) === String(member._id),
    );
    if (existing) {
      existing.updateOne.update.$set.showOnHomepage = isFeaturedHomepageName(
        member.name,
      );
    } else {
      ops.push({
        updateOne: {
          filter: { _id: member._id },
          update: {
            $set: { showOnHomepage: isFeaturedHomepageName(member.name) },
          },
        },
      });
    }
  }

  if (noneFeatured && missingHomepage.length === 0) {
    for (const member of members) {
      if (!isFeaturedHomepageName(member.name)) continue;
      ops.push({
        updateOne: {
          filter: { _id: member._id },
          update: { $set: { showOnHomepage: true } },
        },
      });
    }
  }

  if (ops.length > 0) {
    await TeamData.bulkWrite(ops);
    return true;
  }
  return false;
}

async function fetchAllTeamMembers(): Promise<TeamMember[]> {
  await connectDB();
  const members = await TeamData.find()
    .select("name title discordId linkedin imgSrc sortOrder showOnHomepage -_id")
    .lean<TeamMember[]>();
  return sortTeam(members);
}

export async function getCachedTeamMembers(): Promise<TeamMember[]> {
  const didBackfill = await backfillTeamDefaults();
  if (didBackfill) {
    revalidateDataTags("team");
    return fetchAllTeamMembers();
  }

  const members = await redisCached(
    "team:members:all",
    () =>
      cachedQuery(["team", "members"], fetchAllTeamMembers, {
        revalidate: 600,
        tags: ["team"],
      }),
    { ttlSec: 600, tags: ["team"] },
  );

  return sortTeam(members);
}

export async function getCachedHomepageTeamMembers(): Promise<TeamMember[]> {
  const members = await getCachedTeamMembers();
  return members.filter((member) => member.showOnHomepage);
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
          .sort({ sortOrder: 1, _id: 1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        TeamData.countDocuments(),
      ]);
      return { data, total, page, limit };
    },
    { ttlSec: 600, tags: ["team"] },
  );
}

export async function getPaginatedTeamList(options: TeamListOptions = {}) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 50;
  const result = await getCachedTeamList({ page, limit });
  return buildPaginatedResponse(result.data, result.total, page, limit);
}
