import mongoose from "mongoose";

const EditorBlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },

    metadata: {
      title: String,
      author: String,
      date: String,
      tag: String,
      image: String,
    },

    blocks: {
      type: Array,
      default: [],
    },
    // 👇 NEW
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.EditorBlog ||
  mongoose.model("EditorBlog", EditorBlogSchema);
