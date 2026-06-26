import connectDB from "@/lib/mongodb";
import DiscordAppealSubmission from "@/models/DiscordAppealSubmission";
import { getDiscordAppealConfig } from "./config";
import { isDiscordAppealReviewer } from "./validateReviewer";
import {
  sendDiscordAppealResultDm,
  updateDiscordAppealReviewMessage,
} from "@/lib/discord/notifyDiscordAppeal";

export type ReviewAction = "approve" | "reject";

type ReviewResult =
  | { ok: true; message: string }
  | { ok: false; message: string; ephemeral: boolean };

export async function reviewDiscordAppealSubmission(input: {
  submissionId: string;
  action: ReviewAction;
  reviewerDiscordUserId: string;
  reviewerUsername: string;
}): Promise<ReviewResult> {
  const config = getDiscordAppealConfig();
  if (!config) {
    return { ok: false, message: "Discord appeal is not configured.", ephemeral: true };
  }

  const isReviewer = await isDiscordAppealReviewer(input.reviewerDiscordUserId);
  if (!isReviewer) {
    return {
      ok: false,
      message: "You do not have permission to review appeals.",
      ephemeral: true,
    };
  }

  await connectDB();

  const submission = await DiscordAppealSubmission.findById(input.submissionId);
  if (!submission) {
    return { ok: false, message: "Submission not found.", ephemeral: true };
  }

  if (submission.status !== "pending") {
    return {
      ok: false,
      message: `This appeal was already ${submission.status}.`,
      ephemeral: true,
    };
  }

  const newStatus = input.action === "approve" ? "approved" : "rejected";
  submission.status = newStatus;
  submission.reviewedBy = {
    discordUserId: input.reviewerDiscordUserId,
    username: input.reviewerUsername,
  };
  submission.reviewedAt = new Date();
  await submission.save();

  try {
    await sendDiscordAppealResultDm(
      submission.discordUserId,
      submission.appealType,
      input.action,
    );
  } catch (err) {
    console.error("[discord-appeal] Failed to send result DM:", err);
  }

  if (submission.discordMessageId) {
    try {
      await updateDiscordAppealReviewMessage(
        config.banAppealChannelId,
        submission.discordMessageId,
        {
          submissionId: submission._id.toString(),
          discordUserId: submission.discordUserId,
          discordUsername: submission.discordUsername,
          appealType: submission.appealType,
          responses: submission.responses,
          status: newStatus,
          reviewedBy: input.reviewerUsername,
        },
      );
    } catch (err) {
      console.error("[discord-appeal] Failed to update review message:", err);
    }
  }

  return {
    ok: true,
    message:
      input.action === "approve"
        ? `Appeal approved for ${submission.discordUsername}. They have been notified via DM.`
        : `Appeal rejected for ${submission.discordUsername}. They have been notified via DM.`,
  };
}

export function parseAppealButtonCustomId(
  customId: string,
): { action: ReviewAction; submissionId: string } | null {
  const [prefix, submissionId] = customId.split(":");
  if (!submissionId) return null;

  if (prefix === "appeal_approve") {
    return { action: "approve", submissionId };
  }
  if (prefix === "appeal_reject") {
    return { action: "reject", submissionId };
  }

  return null;
}
