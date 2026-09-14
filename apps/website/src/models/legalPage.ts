import { Schema, model, models } from "mongoose";

const LegalDraftSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: Array, default: [] },
    updatedAt: { type: Date, required: true },
  },
  { _id: false },
);

const legalPageSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    content: { type: Array, default: [] },
    lastPublishedAt: { type: Date, required: true },
    draft: { type: LegalDraftSchema, default: null },
  },
  { timestamps: true },
);

if (models.LegalPage) {
  delete models.LegalPage;
}

const LegalPage = model("LegalPage", legalPageSchema);

export default LegalPage;
