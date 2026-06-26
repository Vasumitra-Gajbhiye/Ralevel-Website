import mongoose from "mongoose";

const DiscordAppealBanSchema = new mongoose.Schema(
  {
    discordUserId: { type: String, required: true, unique: true, index: true },
    reason: { type: String, required: true },
    bannedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.models.DiscordAppealBan ||
  mongoose.model("DiscordAppealBan", DiscordAppealBanSchema);
