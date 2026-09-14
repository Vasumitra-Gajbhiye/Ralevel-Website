import {
  backfillTeamDefaults,
  sortTeam,
  type TeamMember,
} from "@/lib/data/team";
import connectDB from "@/lib/mongodb";
import TeamData from "@/models/teamData";
import { Types } from "mongoose";

export type AdminTeamMember = TeamMember & {
  _id: string;
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

export function serializeTeamMember(doc: {
  _id: Types.ObjectId | string;
  name?: string;
  title?: string;
  discordId?: string;
  linkedin?: string;
  imgSrc?: string;
  sortOrder?: number;
  showOnHomepage?: boolean;
}): AdminTeamMember {
  return {
    _id: String(doc._id),
    name: doc.name ?? "",
    title: doc.title ?? "",
    discordId: doc.discordId ?? "",
    linkedin: doc.linkedin || undefined,
    imgSrc: doc.imgSrc || undefined,
    sortOrder: typeof doc.sortOrder === "number" ? doc.sortOrder : 0,
    showOnHomepage: Boolean(doc.showOnHomepage),
  };
}

export async function getAdminTeamMembers(): Promise<AdminTeamMember[]> {
  await connectDB();
  await backfillTeamDefaults();
  const members = await TeamData.find()
    .select("name title discordId linkedin imgSrc sortOrder showOnHomepage")
    .lean<TeamDoc[]>();
  return sortTeam(members.map(serializeTeamMember));
}

export async function getNextTeamSortOrder(): Promise<number> {
  await connectDB();
  const last = await TeamData.findOne()
    .sort({ sortOrder: -1 })
    .select("sortOrder")
    .lean<{ sortOrder?: number } | null>();
  return (typeof last?.sortOrder === "number" ? last.sortOrder : -1) + 1;
}
