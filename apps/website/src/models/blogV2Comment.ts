import mongoose from "mongoose";

const BlogV2CommentSchema = new mongoose.Schema(
  {
    blogSlug: { type: String, required: true, index: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
    },
    authorName: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogV2Comment",
      default: null,
      index: true,
    },
    rootId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogV2Comment",
      default: null,
      index: true,
    },
    depth: { type: Number, default: 0, min: 0 },
    replyCount: { type: Number, default: 0, min: 0 },
    likeCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

BlogV2CommentSchema.index({ blogSlug: 1, parentId: 1, createdAt: -1 });
BlogV2CommentSchema.index({ blogSlug: 1, rootId: 1, createdAt: 1 });

export default mongoose.models.BlogV2Comment ||
  mongoose.model("BlogV2Comment", BlogV2CommentSchema);
