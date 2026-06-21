import connectDB from "@/lib/mongodb";
import { buildPaginatedResponse, type PaginatedResult } from "@/lib/pagination";
import GraphicMember from "@/models/graphicMember";
import { Types } from "mongoose";

export type AdminGraphicMember = {
  _id: string;
  userId?: string;
  username?: string;
  email?: string;
  positionStart?: string;
  activity:
    | "no_concern"
    | "raised_concern"
    | "requires_notice"
    | "not_required";
  resourceSubmissions: number;
};

type GraphicMemberDoc = {
  _id: Types.ObjectId;
  userId?: string;
  username?: string;
  email?: string;
  positionStart?: Date | string;
  activity: AdminGraphicMember["activity"];
  resourceSubmissions: number;
};

type GetAdminGraphicListParams = {
  page: number;
  limit: number;
  skip: number;
};

export async function getAdminGraphicList({
  page,
  limit,
  skip,
}: GetAdminGraphicListParams): Promise<PaginatedResult<AdminGraphicMember>> {
  await connectDB();

  const [members, total] = await Promise.all([
    GraphicMember.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<GraphicMemberDoc[]>(),
    GraphicMember.countDocuments(),
  ]);

  const data: AdminGraphicMember[] = members.map((member) => ({
    _id: member._id.toString(),
    userId: member.userId,
    username: member.username,
    email: member.email,
    positionStart:
      member.positionStart instanceof Date
        ? member.positionStart.toISOString()
        : member.positionStart,
    activity: member.activity,
    resourceSubmissions: member.resourceSubmissions,
  }));

  return buildPaginatedResponse(data, total, page, limit);
}
