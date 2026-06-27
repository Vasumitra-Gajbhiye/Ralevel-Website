import mongoose from "mongoose";

const BlogV2Schema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },

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

    likeCount: { type: Number, default: 0, min: 0 },
    commentCount: { type: Number, default: 0, min: 0 },

    // Future: status, reviewNote, submittedAt
  },
  { timestamps: true },
);

export default mongoose.models.BlogV2 ||
  mongoose.model("BlogV2", BlogV2Schema);
