import mongoose from "mongoose";

const ReviewedBySchema = new mongoose.Schema(
  {
    discordUserId: { type: String, required: true },
    username: { type: String, required: true },
  },
  { _id: false },
);

const ResponsesSchema = new mongoose.Schema(
  {
    q1: { type: String, required: true },
    q2: { type: String, required: true },
    q3: { type: String, required: true },
  },
  { _id: false },
);

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
    responses: { type: ResponsesSchema, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    reviewedBy: { type: ReviewedBySchema },
    reviewedAt: { type: Date },
    discordMessageId: { type: String },
    metadata: {
      ip: String,
      userAgent: String,
    },
    submittedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);

DiscordAppealSubmissionSchema.index({
  discordUserId: 1,
  appealType: 1,
  submittedAt: -1,
});
DiscordAppealSubmissionSchema.index({ status: 1, submittedAt: -1 });

export default mongoose.models.DiscordAppealSubmission ||
  mongoose.model("DiscordAppealSubmission", DiscordAppealSubmissionSchema);
