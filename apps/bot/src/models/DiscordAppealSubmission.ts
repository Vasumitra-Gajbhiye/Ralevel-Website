import mongoose from "mongoose";

const DiscordAppealSubmissionSchema = new mongoose.Schema(
  {
    discordUserId: { type: String, required: true, index: true },
    discordUsername: { type: String, required: true },
    discordAvatar: { type: String },
    appealType: {
      type: String,
      enum: ["ban", "warning", "timeout"],
      required: true,
    },
    responses: {
      q1: { type: String, required: true },
      q2: { type: String, required: true },
      q3: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    reviewedBy: {
      discordUserId: String,
      username: String,
    },
    reviewedAt: { type: Date },
    discordMessageId: { type: String },
    submittedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true, strict: false },
);

export default mongoose.models.DiscordAppealSubmission ||
  mongoose.model("DiscordAppealSubmission", DiscordAppealSubmissionSchema);
