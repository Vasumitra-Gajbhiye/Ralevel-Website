import mongoose from "mongoose";

const FormSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    cycleId: { type: Number },
    formType: { type: String },
    inchargeNicknames: { type: [String], default: [] },
  },
  { timestamps: true, strict: false },
);

export default mongoose.models.Form || mongoose.model("Form", FormSchema);
