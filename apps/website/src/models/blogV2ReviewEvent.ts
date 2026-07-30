import type {
  BlogV2ContentSnapshot,
  BlogV2ReviewAction,
  BlogV2ReviewType,
} from "@/types/blogV2";
import mongoose from "mongoose";

const SubmissionSnapshotSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    metadata: {
      title: String,
      author: String,
      date: String,
      tag: String,
      image: String,
      description: String,
      readTimeMinutes: Number,
      authorBio: String,
      authorFollowers: Number,
    },
    content: { type: Array, default: [] },
  },
  { _id: false },
);

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
      enum: ["submitted", "approved", "rejected", "restored"],
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
    submissionSnapshot: { type: SubmissionSnapshotSchema, default: null },
    versionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogV2Version",
      default: null,
    },
    restoredVersionNumber: { type: Number, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

BlogV2ReviewEventSchema.index({ blogId: 1, createdAt: -1 });
BlogV2ReviewEventSchema.index({ createdAt: -1 });

export type BlogV2ReviewEventDocument = mongoose.Document & {
  blogId: mongoose.Types.ObjectId;
  action: BlogV2ReviewAction;
  actorId: mongoose.Types.ObjectId;
  note?: string | null;
  reviewType?: BlogV2ReviewType | null;
  submissionSnapshot?: BlogV2ContentSnapshot | null;
  versionId?: mongoose.Types.ObjectId | null;
  restoredVersionNumber?: number | null;
  createdAt?: Date;
};

export default mongoose.models.BlogV2ReviewEvent ||
  mongoose.model("BlogV2ReviewEvent", BlogV2ReviewEventSchema);
