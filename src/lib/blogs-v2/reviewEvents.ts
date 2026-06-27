import connectDB from "@/lib/mongodb";
import BlogV2ReviewEvent from "@/models/blogV2ReviewEvent";
import type { BlogV2ReviewAction, BlogV2ReviewType } from "@/types/blogV2";
import mongoose from "mongoose";

export async function logBlogV2ReviewEvent(params: {
  blogId: string;
  action: BlogV2ReviewAction;
  actorId: string;
  note?: string;
  reviewType?: BlogV2ReviewType | null;
}): Promise<void> {
  await connectDB();

  await BlogV2ReviewEvent.create({
    blogId: new mongoose.Types.ObjectId(params.blogId),
    action: params.action,
    actorId: new mongoose.Types.ObjectId(params.actorId),
    note: params.note ?? null,
    reviewType: params.reviewType ?? null,
  });
}
