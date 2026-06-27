import connectDB from "@/lib/mongodb";
import BlogV2ReviewEvent from "@/models/blogV2ReviewEvent";
import type {
  BlogV2ContentSnapshot,
  BlogV2ReviewAction,
  BlogV2ReviewType,
} from "@/types/blogV2";
import mongoose from "mongoose";

export async function logBlogV2ReviewEvent(params: {
  blogId: string;
  action: BlogV2ReviewAction;
  actorId: string;
  note?: string;
  reviewType?: BlogV2ReviewType | null;
  submissionSnapshot?: BlogV2ContentSnapshot | null;
  versionId?: string | null;
  restoredVersionNumber?: number | null;
}): Promise<string> {
  await connectDB();

  const event = await BlogV2ReviewEvent.create({
    blogId: new mongoose.Types.ObjectId(params.blogId),
    action: params.action,
    actorId: new mongoose.Types.ObjectId(params.actorId),
    note: params.note ?? null,
    reviewType: params.reviewType ?? null,
    submissionSnapshot: params.submissionSnapshot ?? null,
    versionId: params.versionId
      ? new mongoose.Types.ObjectId(params.versionId)
      : null,
    restoredVersionNumber: params.restoredVersionNumber ?? null,
  });

  return event._id.toString();
}

export async function linkReviewEventVersion(
  eventId: string,
  versionId: string,
): Promise<void> {
  await connectDB();
  if (
    !mongoose.Types.ObjectId.isValid(eventId) ||
    !mongoose.Types.ObjectId.isValid(versionId)
  ) {
    return;
  }
  await BlogV2ReviewEvent.findByIdAndUpdate(eventId, {
    versionId: new mongoose.Types.ObjectId(versionId),
  });
}
