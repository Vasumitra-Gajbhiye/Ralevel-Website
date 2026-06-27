import type {
  BlogV2DraftLayer,
  BlogV2Metadata,
  BlogV2PendingReview,
  BlogV2ReviewType,
  BlogV2Status,
} from "@/types/blogV2";
import mongoose from "mongoose";

const ContentSnapshotSchema = new mongoose.Schema(
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
    updatedAt: Date,
  },
  { _id: false },
);

const PendingReviewSchema = new mongoose.Schema(
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
    updatedAt: Date,
    submittedAt: Date,
  },
  { _id: false },
);

const BlogV2Schema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String },

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

    content: {
      type: Array,
      default: [],
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "in_review", "changes_requested", "published"],
      default: "draft",
      index: true,
    },

    draft: { type: ContentSnapshotSchema, default: null },
    pendingReview: { type: PendingReviewSchema, default: null },

    reviewNote: { type: String, default: null },
    reviewedAt: { type: Date, default: null },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      default: null,
    },
    submittedAt: { type: Date, default: null },
    publishedAt: { type: Date, default: null },
    previewToken: { type: String, required: true, index: true },
    reviewType: {
      type: String,
      enum: ["initial", "update"],
      default: null,
    },

    likeCount: { type: Number, default: 0, min: 0 },
    commentCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

BlogV2Schema.index({ slug: 1 }, { unique: true, sparse: true });

export type BlogV2Document = mongoose.Document & {
  title: string;
  slug?: string | null;
  metadata?: BlogV2Metadata;
  content?: unknown[];
  ownerId: mongoose.Types.ObjectId;
  status: BlogV2Status;
  draft?: BlogV2DraftLayer | null;
  pendingReview?: BlogV2PendingReview | null;
  reviewNote?: string | null;
  reviewedAt?: Date | null;
  reviewedBy?: mongoose.Types.ObjectId | null;
  submittedAt?: Date | null;
  publishedAt?: Date | null;
  previewToken: string;
  reviewType?: BlogV2ReviewType | null;
  likeCount?: number;
  commentCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export default mongoose.models.BlogV2 ||
  mongoose.model("BlogV2", BlogV2Schema);
