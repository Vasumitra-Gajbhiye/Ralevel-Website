// models/FormIndex.ts
import mongoose from "mongoose";

const DecisionEmailTemplateSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    body: { type: String, required: true },
  },
  { _id: false },
);

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
    decisionEmails: {
      accepted: DecisionEmailTemplateSchema,
      rejected: DecisionEmailTemplateSchema,
    },
  },
  { timestamps: true }
);

export default mongoose.models.FormIndex ||
  mongoose.model("FormIndex", FormIndexSchema);
