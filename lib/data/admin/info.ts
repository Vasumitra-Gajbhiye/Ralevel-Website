import connectDB from "@/lib/mongodb";
import { buildPaginatedResponse, type PaginatedResult } from "@/lib/pagination";
import InformativeMember from "@/models/informativeMember";
import { Types } from "mongoose";

export type AdminInfoMember = {
  _id: string;
  username?: string;
  userId?: string;
  email?: string;
  positionStart?: string;
  activity:
    | "no_concern"
    | "raised_concern"
    | "requires_notice"
    | "not_required";
};

type InfoMemberDoc = {
  _id: Types.ObjectId;
  username?: string;
  userId?: string;
  email?: string;
  positionStart?: Date | string;
  activity: AdminInfoMember["activity"];
};

type GetAdminInfoListParams = {
  page: number;
  limit: number;
  skip: number;
};

export async function getAdminInfoList({
  page,
  limit,
  skip,
}: GetAdminInfoListParams): Promise<PaginatedResult<AdminInfoMember>> {
  await connectDB();

  const [members, total] = await Promise.all([
    InformativeMember.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<InfoMemberDoc[]>(),
    InformativeMember.countDocuments(),
  ]);

  const data: AdminInfoMember[] = members.map((member) => ({
    _id: member._id.toString(),
    username: member.username,
    userId: member.userId,
    email: member.email,
    positionStart:
      member.positionStart instanceof Date
        ? member.positionStart.toISOString()
        : member.positionStart,
    activity: member.activity,
  }));

  return buildPaginatedResponse(data, total, page, limit);
}
