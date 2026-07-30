import {
  editAppealReviewMessage,
  postAppealReviewMessage,
  sendDirectMessage,
  type DiscordAppealNotification,
} from "@ralevel/discord";
import {
  DISCORD_APPEAL_INVITE_URL,
  getDiscordAppealBotConfig,
} from "../config.js";
import connectDB from "../db.js";
import DiscordAppealSubmission from "../models/DiscordAppealSubmission.js";

const APPEAL_TYPE_LABELS: Record<
  DiscordAppealNotification["appealType"],
  string
> = {
  ban: "ban appeal",
  warning: "warnings appeal",
  timeout: "timeout/mute appeal",
};

export type AppealSubmittedPayload = DiscordAppealNotification & {
  sendAckDm?: boolean;
};

export async function handleAppealSubmitted(
  data: AppealSubmittedPayload,
): Promise<{ ok: true; messageId: string | null; skipped?: boolean }> {
  const config = getDiscordAppealBotConfig();
  if (!config) {
    console.warn("[bot] Discord appeal config is incomplete");
    return { ok: true, messageId: null, skipped: true };
  }

  const messageId = await postAppealReviewMessage(
    config.botToken,
    config.banAppealChannelId,
    data,
  );

  if (data.sendAckDm !== false) {
    try {
      await sendDirectMessage(
        config.botToken,
        data.discordUserId,
        "Your appeal has been received. You will be notified via Discord DM once it has been reviewed.",
      );
    } catch (err) {
      console.error("[bot] Failed to send appeal ack DM:", err);
    }
  }

  return { ok: true, messageId };
}

export type ReviewAction = "approve" | "reject";

type ReviewResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

async function fetchGuildMemberRoles(
  botToken: string,
  guildId: string,
  userId: string,
): Promise<string[]> {
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`,
    {
      headers: { Authorization: `Bot ${botToken}` },
    },
  );

  if (!response.ok) return [];
  const member = (await response.json()) as { roles?: string[] };
  return member.roles ?? [];
}

async function isDiscordAppealReviewer(
  discordUserId: string,
): Promise<boolean> {
  const config = getDiscordAppealBotConfig();
  if (!config) return false;

  const roles = await fetchGuildMemberRoles(
    config.botToken,
    config.guildId,
    discordUserId,
  );

  return roles.some((roleId) => config.reviewerRoleIds.includes(roleId));
}

export async function reviewDiscordAppealSubmission(input: {
  submissionId: string;
  action: ReviewAction;
  reviewerDiscordUserId: string;
  reviewerUsername: string;
}): Promise<ReviewResult> {
  const config = getDiscordAppealBotConfig();
  if (!config) {
    return { ok: false, message: "Discord appeal is not configured." };
  }

  const isReviewer = await isDiscordAppealReviewer(input.reviewerDiscordUserId);
  if (!isReviewer) {
    return {
      ok: false,
      message: "You do not have permission to review appeals.",
    };
  }

  await connectDB();

  const submission = await DiscordAppealSubmission.findById(input.submissionId);
  if (!submission) {
    return { ok: false, message: "Submission not found." };
  }

  if (submission.status !== "pending") {
    return {
      ok: false,
      message: `This appeal was already ${submission.status}.`,
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
    const label = APPEAL_TYPE_LABELS[submission.appealType as keyof typeof APPEAL_TYPE_LABELS];
    let content: string;
    if (input.action === "approve") {
      content = `Your ${label} for the r/alevel Discord server has been approved.`;
      if (submission.appealType === "ban") {
        content += ` You can rejoin the server using this invite link: ${DISCORD_APPEAL_INVITE_URL}`;
      }
    } else {
      content = `Your ${label} for the r/alevel Discord server has been rejected.`;
    }
    await sendDirectMessage(config.botToken, submission.discordUserId, content);
  } catch (err) {
    console.error("[bot] Failed to send result DM:", err);
  }

  if (submission.discordMessageId) {
    try {
      await editAppealReviewMessage(
        config.botToken,
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
      console.error("[bot] Failed to update review message:", err);
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
