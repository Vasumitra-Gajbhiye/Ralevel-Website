import type { BlogV2Metadata, BlogV2ReviewType } from "@/types/blogV2";
import mongoose from "mongoose";

const MetadataSchema = new mongoose.Schema(
  {
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
  { _id: false },
);

const BlogV2VersionSchema = new mongoose.Schema(
  {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogV2",
      required: true,
      index: true,
    },
    versionNumber: { type: Number, required: true },
    title: { type: String, required: true },
    metadata: { type: MetadataSchema, default: {} },
    content: { type: Array, default: [] },
    approvedAt: { type: Date, required: true },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
    },
    reviewType: {
      type: String,
      enum: ["initial", "update"],
      default: null,
    },
    reviewEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogV2ReviewEvent",
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

BlogV2VersionSchema.index({ blogId: 1, versionNumber: -1 }, { unique: true });

export type BlogV2VersionDocument = mongoose.Document & {
  blogId: mongoose.Types.ObjectId;
  versionNumber: number;
  title: string;
  metadata?: BlogV2Metadata;
  content?: unknown[];
  approvedAt: Date;
  approvedBy: mongoose.Types.ObjectId;
  reviewType?: BlogV2ReviewType | null;
  reviewEventId?: mongoose.Types.ObjectId | null;
  createdAt?: Date;
};

export default mongoose.models.BlogV2Version ||
  mongoose.model("BlogV2Version", BlogV2VersionSchema);
