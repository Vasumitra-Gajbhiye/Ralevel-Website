import mongoose from "mongoose";

const BlogV2CommentLikeSchema = new mongoose.Schema(
  {
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogV2Comment",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

BlogV2CommentLikeSchema.index({ commentId: 1, userId: 1 }, { unique: true });

export default mongoose.models.BlogV2CommentLike ||
  mongoose.model("BlogV2CommentLike", BlogV2CommentLikeSchema);
