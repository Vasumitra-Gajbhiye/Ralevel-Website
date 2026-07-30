import mongoose from "mongoose";

const BlogV2LikeSchema = new mongoose.Schema(
  {
    blogSlug: { type: String, required: true, index: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

BlogV2LikeSchema.index({ blogSlug: 1, userId: 1 }, { unique: true });

export default mongoose.models.BlogV2Like ||
  mongoose.model("BlogV2Like", BlogV2LikeSchema);
