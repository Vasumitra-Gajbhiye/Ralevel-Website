import {
  editAppealReviewMessage,
  postAppealReviewMessage,
  sendDirectMessage,
  type DiscordAppealNotification,
} from "@ralevel/discord";
import { Resend } from "resend";
import {
  DISCORD_APPEAL_INVITE_URL,
  getDiscordAppealBotConfig,
} from "../config.js";
import connectDB from "../db.js";
import DiscordAppealSubmission from "../models/DiscordAppealSubmission.js";
import { banAppealDecisionEmailHtml } from "./banAppealEmail.js";

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

function appealDisplayName(doc: {
  appealType?: string;
  discordUsername?: unknown;
  submitterName?: unknown;
  submitterEmail?: unknown;
  banId?: unknown;
}): string {
  if (doc.appealType === "ban") {
    return (
      (typeof doc.submitterName === "string" && doc.submitterName.trim()) ||
      (typeof doc.submitterEmail === "string" && doc.submitterEmail.trim()) ||
      (typeof doc.banId === "string" && doc.banId.trim()) ||
      "Unknown"
    );
  }
  return (
    (typeof doc.discordUsername === "string" && doc.discordUsername.trim()) ||
    "Unknown"
  );
}

function toNotification(
  submission: InstanceType<typeof DiscordAppealSubmission> & {
    _id: { toString(): string };
  },
  overrides?: Partial<DiscordAppealNotification>,
): DiscordAppealNotification {
  return {
    submissionId: submission._id.toString(),
    discordUserId: submission.discordUserId
      ? String(submission.discordUserId)
      : undefined,
    discordUsername: submission.discordUsername
      ? String(submission.discordUsername)
      : undefined,
    appealType: submission.appealType as DiscordAppealNotification["appealType"],
    responses: {
      q1: String(submission.responses.q1),
      q2: String(submission.responses.q2),
      q3: String(submission.responses.q3),
    },
    status: (overrides?.status ??
      submission.status) as DiscordAppealNotification["status"],
    reviewedBy: overrides?.reviewedBy,
    banId: submission.banId ? String(submission.banId) : undefined,
    submitterEmail: submission.submitterEmail
      ? String(submission.submitterEmail)
      : undefined,
    submitterName: submission.submitterName
      ? String(submission.submitterName)
      : undefined,
  };
}

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

  if (data.sendAckDm !== false && data.discordUserId) {
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

export async function isDiscordAppealReviewer(
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

export const PENDING_APPEALS_PAGE_SIZE = 15;

export type PendingAppealSummary = {
  submissionId: string;
  discordUserId: string;
  discordUsername: string;
  appealType: DiscordAppealNotification["appealType"];
  submittedAt: Date;
};

export async function listPendingAppeals(input: {
  page?: number;
  pageSize?: number;
}): Promise<{
  items: PendingAppealSummary[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const pageSize = input.pageSize ?? PENDING_APPEALS_PAGE_SIZE;
  const page = Math.max(1, Math.floor(input.page ?? 1));
  const skip = (page - 1) * pageSize;

  await connectDB();

  const [total, docs] = await Promise.all([
    DiscordAppealSubmission.countDocuments({ status: "pending" }),
    DiscordAppealSubmission.find({ status: "pending" })
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(pageSize),
  ]);

  const items: PendingAppealSummary[] = docs.map((doc) => ({
    submissionId: doc._id.toString(),
    discordUserId: doc.discordUserId ? String(doc.discordUserId) : "",
    discordUsername: appealDisplayName(doc),
    appealType: doc.appealType as DiscordAppealNotification["appealType"],
    submittedAt:
      doc.submittedAt instanceof Date
        ? doc.submittedAt
        : new Date(String(doc.submittedAt)),
  }));

  return { items, total, page, pageSize };
}

export async function getAppealById(submissionId: string): Promise<{
  submissionId: string;
  discordUserId: string;
  discordUsername: string;
  appealType: DiscordAppealNotification["appealType"];
  responses: { q1: string; q2: string; q3: string };
  status: DiscordAppealNotification["status"];
  reviewedBy?: string;
  submittedAt: Date;
  banId?: string;
  submitterEmail?: string;
  submitterName?: string;
} | null> {
  await connectDB();

  const submission = await DiscordAppealSubmission.findById(submissionId);
  if (!submission) return null;

  return {
    submissionId: submission._id.toString(),
    discordUserId: submission.discordUserId
      ? String(submission.discordUserId)
      : "",
    discordUsername: appealDisplayName(submission),
    appealType: submission.appealType as DiscordAppealNotification["appealType"],
    responses: {
      q1: String(submission.responses.q1),
      q2: String(submission.responses.q2),
      q3: String(submission.responses.q3),
    },
    status: submission.status as DiscordAppealNotification["status"],
    reviewedBy: submission.reviewedBy?.username
      ? String(submission.reviewedBy.username)
      : undefined,
    submittedAt:
      submission.submittedAt instanceof Date
        ? submission.submittedAt
        : new Date(String(submission.submittedAt)),
    banId: submission.banId ? String(submission.banId) : undefined,
    submitterEmail: submission.submitterEmail
      ? String(submission.submitterEmail)
      : undefined,
    submitterName: submission.submitterName
      ? String(submission.submitterName)
      : undefined,
  };
}

async function notifyBanAppealByEmail(input: {
  email: string;
  name?: string | null;
  approved: boolean;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.error("[bot] RESEND_API_KEY missing — cannot email ban appeal outcome");
    return false;
  }

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "r/alevel <application@ralevel.com>";

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from,
    to: input.email,
    subject: input.approved
      ? "Your ban appeal was approved"
      : "Your ban appeal was rejected",
    html: banAppealDecisionEmailHtml({
      name: input.name,
      approved: input.approved,
      inviteUrl: input.approved ? DISCORD_APPEAL_INVITE_URL : undefined,
    }),
  });

  return true;
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

  const displayName = appealDisplayName(submission);
  let notifiedVia: "email" | "DM" | "none" = "none";

  if (submission.appealType === "ban") {
    const email =
      typeof submission.submitterEmail === "string"
        ? submission.submitterEmail.trim()
        : "";
    if (email) {
      try {
        const sent = await notifyBanAppealByEmail({
          email,
          name: submission.submitterName
            ? String(submission.submitterName)
            : null,
          approved: input.action === "approve",
        });
        if (sent) notifiedVia = "email";
      } catch (err) {
        console.error("[bot] Failed to send ban appeal result email:", err);
      }
    } else {
      console.error(
        "[bot] Ban appeal missing submitterEmail — cannot notify appellant",
      );
    }
  } else if (submission.discordUserId) {
    try {
      const label =
        APPEAL_TYPE_LABELS[
          submission.appealType as keyof typeof APPEAL_TYPE_LABELS
        ];
      let content: string;
      if (input.action === "approve") {
        content = `Your ${label} for the r/alevel Discord server has been approved.`;
      } else {
        content = `Your ${label} for the r/alevel Discord server has been rejected.`;
      }
      await sendDirectMessage(
        config.botToken,
        String(submission.discordUserId),
        content,
      );
      notifiedVia = "DM";
    } catch (err) {
      console.error("[bot] Failed to send result DM:", err);
    }
  }

  if (submission.discordMessageId) {
    try {
      await editAppealReviewMessage(
        config.botToken,
        config.banAppealChannelId,
        submission.discordMessageId,
        toNotification(submission, {
          status: newStatus,
          reviewedBy: input.reviewerUsername,
        }),
      );
    } catch (err) {
      console.error("[bot] Failed to update review message:", err);
    }
  }

  const notifyLabel =
    notifiedVia === "email"
      ? "They have been notified via email."
      : notifiedVia === "DM"
        ? "They have been notified via DM."
        : "They could not be notified automatically.";

  return {
    ok: true,
    message:
      input.action === "approve"
        ? `Appeal approved for ${displayName}. ${notifyLabel}`
        : `Appeal rejected for ${displayName}. ${notifyLabel}`,
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
