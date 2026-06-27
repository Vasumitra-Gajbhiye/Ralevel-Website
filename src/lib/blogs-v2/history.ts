import connectDB from "@/lib/mongodb";
import { getWriterProfile } from "@/lib/data/admin/writerProfile";
import { buildPaginatedResponse, type PaginatedResult } from "@/lib/pagination";
import BlogV2 from "@/models/blogV2";
import BlogV2ReviewEvent from "@/models/blogV2ReviewEvent";
import BlogV2Version from "@/models/blogV2Version";
import type { BlogV2VersionDocument } from "@/models/blogV2Version";
import type {
  BlogV2GlobalHistoryEntry,
  BlogV2HistoryTimelineItem,
  BlogV2ReviewAction,
} from "@/types/blogV2";
import { format } from "date-fns";
import mongoose from "mongoose";
import { ensureBlogV2Migrated } from "./migrate";

function formatHistoryDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return format(date, "dd MMM yyyy, HH:mm");
}

function actorNameFromLookup(
  name?: string,
  email?: string,
): string {
  if (name?.trim()) return name.trim();
  if (email?.trim()) return email.split("@")[0] || "User";
  return "User";
}

type RawHistoryEvent = {
  _id: mongoose.Types.ObjectId;
  blogId: mongoose.Types.ObjectId;
  action: BlogV2ReviewAction;
  actorId: mongoose.Types.ObjectId;
  note?: string | null;
  reviewType?: string | null;
  submissionSnapshot?: unknown;
  versionId?: mongoose.Types.ObjectId | null;
  restoredVersionNumber?: number | null;
  createdAt: Date;
  actorName?: string;
  actorEmail?: string;
  blogTitle?: string;
  versionNumber?: number | null;
};

function mapToTimelineItem(event: RawHistoryEvent): BlogV2HistoryTimelineItem {
  return {
    _id: event._id.toString(),
    action: event.action,
    actorId: event.actorId.toString(),
    actorName: actorNameFromLookup(event.actorName, event.actorEmail),
    createdAt:
      event.createdAt instanceof Date
        ? event.createdAt.toISOString()
        : String(event.createdAt),
    createdAtLabel: formatHistoryDate(event.createdAt),
    note: event.note ?? null,
    reviewType:
      event.reviewType === "initial" || event.reviewType === "update"
        ? event.reviewType
        : null,
    versionId: event.versionId?.toString() ?? null,
    versionNumber: event.versionNumber ?? event.restoredVersionNumber ?? null,
    hasSubmissionSnapshot: Boolean(event.submissionSnapshot),
  };
}

export async function getBlogHistoryTimeline(
  blogId: string,
): Promise<BlogV2HistoryTimelineItem[]> {
  await connectDB();
  await ensureBlogV2Migrated();

  if (!mongoose.Types.ObjectId.isValid(blogId)) return [];

  const events = await BlogV2ReviewEvent.aggregate([
    { $match: { blogId: new mongoose.Types.ObjectId(blogId) } },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "userdatas",
        localField: "actorId",
        foreignField: "_id",
        as: "actor",
      },
    },
    {
      $lookup: {
        from: "blogv2versions",
        localField: "versionId",
        foreignField: "_id",
        as: "version",
      },
    },
    {
      $project: {
        blogId: 1,
        action: 1,
        actorId: 1,
        note: 1,
        reviewType: 1,
        submissionSnapshot: 1,
        versionId: 1,
        restoredVersionNumber: 1,
        createdAt: 1,
        actorName: { $arrayElemAt: ["$actor.name", 0] },
        actorEmail: { $arrayElemAt: ["$actor.email", 0] },
        versionNumber: { $arrayElemAt: ["$version.versionNumber", 0] },
      },
    },
  ]);

  return events.map((event: RawHistoryEvent) => mapToTimelineItem(event));
}

type GetGlobalBlogReviewHistoryParams = {
  page: number;
  limit: number;
  skip: number;
  blogId?: string;
  action?: BlogV2ReviewAction;
};

export async function getGlobalBlogReviewHistory({
  page,
  limit,
  skip,
  blogId,
  action,
}: GetGlobalBlogReviewHistoryParams): Promise<
  PaginatedResult<BlogV2GlobalHistoryEntry>
> {
  await connectDB();
  await ensureBlogV2Migrated();

  const match: Record<string, unknown> = {};
  if (blogId && mongoose.Types.ObjectId.isValid(blogId)) {
    match.blogId = new mongoose.Types.ObjectId(blogId);
  }
  if (action) {
    match.action = action;
  }

  const [result] = await BlogV2ReviewEvent.aggregate([
    { $match: match },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: "userdatas",
              localField: "actorId",
              foreignField: "_id",
              as: "actor",
            },
          },
          {
            $lookup: {
              from: "blogv2s",
              localField: "blogId",
              foreignField: "_id",
              as: "blog",
            },
          },
          {
            $lookup: {
              from: "blogv2versions",
              localField: "versionId",
              foreignField: "_id",
              as: "version",
            },
          },
          {
            $project: {
              blogId: 1,
              action: 1,
              actorId: 1,
              note: 1,
              reviewType: 1,
              submissionSnapshot: 1,
              versionId: 1,
              restoredVersionNumber: 1,
              createdAt: 1,
              actorName: { $arrayElemAt: ["$actor.name", 0] },
              actorEmail: { $arrayElemAt: ["$actor.email", 0] },
              blogTitle: { $arrayElemAt: ["$blog.title", 0] },
              versionNumber: { $arrayElemAt: ["$version.versionNumber", 0] },
            },
          },
        ],
      },
    },
  ]);

  const total = result.metadata[0]?.total ?? 0;
  const data: BlogV2GlobalHistoryEntry[] = result.data.map(
    (event: RawHistoryEvent) => {
      const item = mapToTimelineItem(event);
      return {
        ...item,
        blogId: event.blogId.toString(),
        blogTitle: event.blogTitle?.trim() || "Untitled document",
      };
    },
  );

  return buildPaginatedResponse(data, total, page, limit);
}

export async function getReviewEventSnapshot(
  blogId: string,
  eventId: string,
) {
  await connectDB();
  if (
    !mongoose.Types.ObjectId.isValid(blogId) ||
    !mongoose.Types.ObjectId.isValid(eventId)
  ) {
    return null;
  }

  const event = await BlogV2ReviewEvent.findOne({
    _id: new mongoose.Types.ObjectId(eventId),
    blogId: new mongoose.Types.ObjectId(blogId),
  })
    .select("submissionSnapshot action")
    .lean<{ submissionSnapshot?: { title: string; metadata?: unknown; content?: unknown[] }; action: string }>();

  if (!event?.submissionSnapshot) return null;
  return event.submissionSnapshot;
}

export async function getVersionSnapshotForPreview(
  blogId: string,
  versionId: string,
) {
  await connectDB();
  if (
    !mongoose.Types.ObjectId.isValid(blogId) ||
    !mongoose.Types.ObjectId.isValid(versionId)
  ) {
    return null;
  }

  return BlogV2Version.findOne({
    _id: new mongoose.Types.ObjectId(versionId),
    blogId: new mongoose.Types.ObjectId(blogId),
  })
    .select("title metadata content")
    .lean<Pick<BlogV2VersionDocument, "title" | "metadata" | "content">>();
}

export async function resolveLastApproverName(
  blogId: string,
): Promise<{ name: string; versionNumber: number | null } | null> {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(blogId)) return null;

  const blog = await BlogV2.findById(blogId)
    .select("lastApprovedBy currentVersionNumber")
    .lean<{
      lastApprovedBy?: mongoose.Types.ObjectId | null;
      currentVersionNumber?: number | null;
    }>();

  if (!blog?.lastApprovedBy) return null;

  const approver = await getWriterProfile(blog.lastApprovedBy.toString());
  if (!approver) return null;

  return {
    name: approver.name,
    versionNumber: blog.currentVersionNumber ?? null,
  };
}
