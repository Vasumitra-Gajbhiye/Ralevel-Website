import mongoose, { Schema, models } from "mongoose";

const CampaignSchema = new Schema({
  name: { type: String, required: true, unique: true },
  raised: { type: Number, default: 0 },
  noContributors: { type: Number, default: 0 },
  goal: { type: Number, default: 100 },
});

export const Campaign =
  models.Campaign || mongoose.model("Campaign", CampaignSchema);
