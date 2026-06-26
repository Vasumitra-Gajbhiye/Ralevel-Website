import type { DiscordEmbed } from "./types";

export type DiscordAppealNotification = {
  submissionId: string;
  discordUserId: string;
  discordUsername: string;
  appealType: "ban" | "warning" | "timeout";
  responses: { q1: string; q2: string; q3: string };
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string;
};

const APPEAL_TYPE_LABELS: Record<DiscordAppealNotification["appealType"], string> =
  {
    ban: "Ban Appeal",
    warning: "Warnings Appeal",
    timeout: "Immediate Timeout/Mute Removal",
  };

const STATUS_COLORS: Record<DiscordAppealNotification["status"], number> = {
  pending: 0x5865f2,
  approved: 0x57f287,
  rejected: 0xed4245,
};

function truncate(text: string, max = 900): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 3)}...`;
}

export function formatAppealEmbed(data: DiscordAppealNotification): DiscordEmbed {
  const title = `${APPEAL_TYPE_LABELS[data.appealType]} — ${data.discordUsername}`;
  const statusLabel =
    data.status === "pending"
      ? "Pending review"
      : data.status === "approved"
        ? `Approved by ${data.reviewedBy ?? "staff"}`
        : `Rejected by ${data.reviewedBy ?? "staff"}`;

  return {
    title,
    color: STATUS_COLORS[data.status],
    fields: [
      { name: "Discord ID", value: data.discordUserId, inline: true },
      { name: "Appeal Type", value: APPEAL_TYPE_LABELS[data.appealType], inline: true },
      { name: "Status", value: statusLabel, inline: true },
      {
        name: "Q1. Why action was taken",
        value: truncate(data.responses.q1),
        inline: false,
      },
      {
        name: "Q2. Reasonable or unreasonable",
        value: truncate(data.responses.q2),
        inline: false,
      },
      {
        name: "Q3. Why appeal should be accepted",
        value: truncate(data.responses.q3),
        inline: false,
      },
    ],
    timestamp: new Date().toISOString(),
    footer: { text: `Submission ${data.submissionId}` },
  };
}

export function buildAppealActionRow(submissionId: string, disabled = false) {
  return {
    type: 1,
    components: [
      {
        type: 2,
        style: 3,
        label: "Approve",
        custom_id: `appeal_approve:${submissionId}`,
        disabled,
      },
      {
        type: 2,
        style: 4,
        label: "Reject",
        custom_id: `appeal_reject:${submissionId}`,
        disabled,
      },
    ],
  };
}
