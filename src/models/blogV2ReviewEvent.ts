import type { BlogV2ReviewAction, BlogV2ReviewType } from "@/types/blogV2";
import mongoose from "mongoose";

const BlogV2ReviewEventSchema = new mongoose.Schema(
  {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogV2",
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ["submitted", "approved", "rejected"],
      required: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
    },
    note: { type: String, default: null },
    reviewType: {
      type: String,
      enum: ["initial", "update"],
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export type BlogV2ReviewEventDocument = mongoose.Document & {
  blogId: mongoose.Types.ObjectId;
  action: BlogV2ReviewAction;
  actorId: mongoose.Types.ObjectId;
  note?: string | null;
  reviewType?: BlogV2ReviewType | null;
  createdAt?: Date;
};

export default mongoose.models.BlogV2ReviewEvent ||
  mongoose.model("BlogV2ReviewEvent", BlogV2ReviewEventSchema);
