import type { DiscordEmbed } from "./types";

export type DiscordAppealNotification = {
  submissionId: string;
  discordUserId?: string;
  discordUsername?: string;
  appealType: "ban" | "warning" | "timeout";
  responses: { q1: string; q2: string; q3: string };
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string;
  banId?: string;
  submitterEmail?: string;
  submitterName?: string;
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

function displayName(data: DiscordAppealNotification): string {
  if (data.appealType === "ban") {
    return (
      data.discordUsername?.trim() ||
      data.submitterName?.trim() ||
      data.submitterEmail?.trim() ||
      "Unknown"
    );
  }
  return data.discordUsername?.trim() || "Unknown";
}

export function formatAppealEmbed(data: DiscordAppealNotification): DiscordEmbed {
  const title = `${APPEAL_TYPE_LABELS[data.appealType]} — ${displayName(data)}`;
  const statusLabel =
    data.status === "pending"
      ? "Pending review"
      : data.status === "approved"
        ? `Approved by ${data.reviewedBy ?? "staff"}`
        : `Rejected by ${data.reviewedBy ?? "staff"}`;

  const identityFields =
    data.appealType === "ban"
      ? [
          {
            name: "Discord ID",
            value: data.discordUserId?.trim() || "—",
            inline: true,
          },
          {
            name: "Discord",
            value: data.discordUsername?.trim()
              ? `@${data.discordUsername.trim()}`
              : "—",
            inline: true,
          },
          {
            name: "Email",
            value: data.submitterEmail?.trim() || "—",
            inline: true,
          },
        ]
      : [
          {
            name: "Discord ID",
            value: data.discordUserId?.trim() || "—",
            inline: true,
          },
        ];

  return {
    title,
    color: STATUS_COLORS[data.status],
    fields: [
      ...identityFields,
      {
        name: "Appeal Type",
        value: APPEAL_TYPE_LABELS[data.appealType],
        inline: true,
      },
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

export type PendingAppealListItem = {
  submissionId: string;
  discordUsername: string;
  appealType: DiscordAppealNotification["appealType"];
  submittedAt: Date | string;
};

const SHORT_TYPE_LABELS: Record<
  DiscordAppealNotification["appealType"],
  string
> = {
  ban: "Ban",
  warning: "Warnings",
  timeout: "Timeout",
};

function formatSubmittedDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "unknown date";
  return date.toISOString().slice(0, 10);
}

export function formatPendingAppealsListEmbed(input: {
  items: PendingAppealListItem[];
  total: number;
  page: number;
  pageSize: number;
}): DiscordEmbed {
  const totalPages = Math.max(1, Math.ceil(input.total / input.pageSize));

  let description: string;
  if (input.total === 0 || input.items.length === 0) {
    description = "No pending appeals.";
  } else {
    description = input.items
      .map((item) => {
        const typeLabel = SHORT_TYPE_LABELS[item.appealType] ?? item.appealType;
        return `\`${item.submissionId}\` — **${item.discordUsername}** · ${typeLabel} · ${formatSubmittedDate(item.submittedAt)}`;
      })
      .join("\n");
  }

  return {
    title: `Pending Appeals (${input.total})`,
    description,
    color: STATUS_COLORS.pending,
    timestamp: new Date().toISOString(),
    footer: {
      text: `Page ${input.page}/${totalPages} · Use /appeal submission_id:<id>`,
    },
  };
}
