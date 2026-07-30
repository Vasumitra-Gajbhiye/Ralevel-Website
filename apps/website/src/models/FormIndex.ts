// models/FormIndex.ts
import mongoose from "mongoose";

const FormIndexSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true }, // writer, reddit-mod
    title: String,
    description: String,
    status: {
      type: String,
      enum: ["open", "soon"],
      default: "open",
    },
    gradient: String, // tailwind gradient
    icon: String, // lucide icon name
    logo: String, // optional image path
    steps: [String],
    ctaText: String,
    order: Number, // for sorting
    activeCycleId: Number,
  },
  { timestamps: true }
);

export default mongoose.models.FormIndex ||
  mongoose.model("FormIndex", FormIndexSchema);
