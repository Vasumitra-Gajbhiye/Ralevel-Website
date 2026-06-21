import connectDB from "@/lib/mongodb";
import { buildPaginatedResponse, type PaginatedResult } from "@/lib/pagination";
import ScheduleItem from "@/models/scheduleItem";
import { Types } from "mongoose";

export type AdminScheduleItem = {
  _id: string;
  event: string;
  date?: string | null;
  ping: "yes" | "no";
  development: "awaiting" | "in_development" | "developed";
  sent: "awaiting" | "sent";
  serverEvent: "required" | "not_required";
  status: "dormant" | "approaching" | "ongoing" | "concluded";
  details?: string;
};

type ScheduleItemDoc = {
  _id: Types.ObjectId;
  event: string;
  date?: Date | string | null;
  ping: AdminScheduleItem["ping"];
  development: AdminScheduleItem["development"];
  sent: AdminScheduleItem["sent"];
  serverEvent: AdminScheduleItem["serverEvent"];
  status: AdminScheduleItem["status"];
  details?: string;
};

type GetAdminSchedulingListParams = {
  page: number;
  limit: number;
  skip: number;
};

export async function getAdminSchedulingList({
  page,
  limit,
  skip,
}: GetAdminSchedulingListParams): Promise<PaginatedResult<AdminScheduleItem>> {
  await connectDB();

  const [items, total] = await Promise.all([
    ScheduleItem.find()
      .sort({ date: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<ScheduleItemDoc[]>(),
    ScheduleItem.countDocuments(),
  ]);

  const data: AdminScheduleItem[] = items.map((item) => ({
    _id: item._id.toString(),
    event: item.event,
    date:
      item.date instanceof Date
        ? item.date.toISOString()
        : item.date ?? null,
    ping: item.ping,
    development: item.development,
    sent: item.sent,
    serverEvent: item.serverEvent,
    status: item.status,
    details: item.details,
  }));

  return buildPaginatedResponse(data, total, page, limit);
}
