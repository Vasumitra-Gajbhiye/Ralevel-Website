import type { DiscordEmbed } from "./types";

const PRIORITY_COLORS: Record<number, number> = {
  1: 0xdc2626, // red
  2: 0xf97316, // orange
  3: 0x3b82f6, // blue
  4: 0x6b7280, // grey
};

export type TaskAssignedNotification = {
  taskTitle: string;
  listName: string;
  departmentName: string | null;
  assignedBy: string;
  dueLabel: string | null;
  priority: 1 | 2 | 3 | 4;
  url: string;
};

export type TaskDigestItem = {
  title: string;
  listName: string;
  dueLabel: string;
  overdue: boolean;
  url: string;
};

export type TaskDigestNotification = {
  overdueCount: number;
  todayCount: number;
  items: TaskDigestItem[];
  todayUrl: string;
};

/** Review and reward DMs for tasks with a star reward. */
export type TaskEventNotification =
  | {
      kind: "review_requested";
      taskTitle: string;
      where: string;
      submittedBy: string;
      stars: number;
      note: string;
      link: string | null;
      url: string;
    }
  | {
      kind: "approved";
      taskTitle: string;
      where: string;
      reviewedBy: string;
      stars: number;
      totalStars: number;
      /** Stars toward the next certificate, out of `perCertificate`. */
      towardNext: number;
      perCertificate: number;
      earnedCertificate: boolean;
      url: string;
    }
  | {
      kind: "changes_requested";
      taskTitle: string;
      where: string;
      reviewedBy: string;
      comment: string;
      url: string;
    }
  | {
      kind: "certificate_due";
      personName: string;
      departmentName: string;
      totalStars: number;
      url: string;
    };

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

/** Escapes characters that would break a markdown link label. */
const linkLabel = (text: string) => clip(text, 80).replace(/[[\]()]/g, "");

export function formatTaskAssignedEmbed(data: TaskAssignedNotification): DiscordEmbed {
  const where = data.departmentName ? `${data.departmentName} · ${data.listName}` : data.listName;
  const fields = [
    { name: "List", value: clip(where, 100), inline: true },
    { name: "Assigned by", value: clip(data.assignedBy, 100), inline: true },
  ];
  if (data.dueLabel) fields.push({ name: "Due", value: `${data.dueLabel} (IST)`, inline: true });
  if (data.priority < 4) fields.push({ name: "Priority", value: `P${data.priority}`, inline: true });

  const embed: DiscordEmbed = {
    title: clip(`New task: ${data.taskTitle}`, 256),
    color: PRIORITY_COLORS[data.priority] ?? PRIORITY_COLORS[4],
    fields: [...fields, { name: "Open", value: `[View task](${data.url})`, inline: false }],
    timestamp: new Date().toISOString(),
  };
  if (/^https?:\/\//i.test(data.url)) embed.url = data.url;
  return embed;
}

export function formatTaskDigestEmbed(data: TaskDigestNotification): DiscordEmbed {
  const parts: string[] = [];
  if (data.overdueCount) parts.push(`${data.overdueCount} overdue`);
  if (data.todayCount) parts.push(`${data.todayCount} due today`);

  const lines = data.items.map(
    (item) =>
      `${item.overdue ? "🔴" : "•"} [${linkLabel(item.title)}](${item.url}) — ${clip(item.listName, 40)}, ${item.dueLabel}`,
  );
  const total = data.overdueCount + data.todayCount;
  if (total > data.items.length) lines.push(`…and ${total - data.items.length} more`);
  lines.push("", `[Open Today](${data.todayUrl})`);

  return {
    title: `Your tasks: ${parts.join(", ")}`,
    description: clip(lines.join("\n"), 4000),
    color: data.overdueCount ? PRIORITY_COLORS[1] : PRIORITY_COLORS[3],
    timestamp: new Date().toISOString(),
  };
}

const STAR = "★";
const starsText = (n: number) => `${STAR.repeat(Math.max(0, Math.min(n, 3)))} ${n} star${n === 1 ? "" : "s"}`;

const REVIEW_COLORS = { amber: 0xf59e0b, green: 0x16a34a, orange: 0xf97316, violet: 0x7c3aed };

export function formatTaskEventEmbed(data: TaskEventNotification): DiscordEmbed {
  const open = (label: string) => ({ name: "Open", value: `[${label}](${data.url})`, inline: false });
  let embed: DiscordEmbed;

  switch (data.kind) {
    case "review_requested": {
      const fields = [
        { name: "List", value: clip(data.where, 100), inline: true },
        { name: "Submitted by", value: clip(data.submittedBy, 100), inline: true },
        { name: "Reward", value: starsText(data.stars), inline: true },
      ];
      if (data.link) fields.push({ name: "Link", value: clip(data.link, 1000), inline: false });
      embed = {
        title: clip(`Ready for review: ${data.taskTitle}`, 256),
        description: data.note ? clip(data.note, 1000) : undefined,
        color: REVIEW_COLORS.amber,
        fields: [...fields, open("Review task")],
        timestamp: new Date().toISOString(),
      };
      break;
    }
    case "approved": {
      const progress = data.earnedCertificate
        ? `You've earned a certificate! 🎉 (${data.totalStars} stars in total)`
        : `${data.towardNext}/${data.perCertificate} toward your next certificate (${data.totalStars} in total)`;
      embed = {
        title: clip(`Approved: ${data.taskTitle}`, 256),
        description: `+${data.stars} ${STAR} from ${clip(data.reviewedBy, 100)}\n${progress}`,
        color: REVIEW_COLORS.green,
        fields: [{ name: "List", value: clip(data.where, 100), inline: true }, open("View task")],
        timestamp: new Date().toISOString(),
      };
      break;
    }
    case "changes_requested": {
      embed = {
        title: clip(`Changes requested: ${data.taskTitle}`, 256),
        description: clip(data.comment, 2000),
        color: REVIEW_COLORS.orange,
        fields: [
          { name: "List", value: clip(data.where, 100), inline: true },
          { name: "From", value: clip(data.reviewedBy, 100), inline: true },
          open("View task"),
        ],
        timestamp: new Date().toISOString(),
      };
      break;
    }
    case "certificate_due": {
      embed = {
        title: clip(`${data.personName} is due a ${data.departmentName} certificate`, 256),
        description: `They've earned ${data.totalStars} ${STAR} from approved tasks. Issue the certificate in Admin → Certificates, then mark it issued on the department page.`,
        color: REVIEW_COLORS.violet,
        fields: [open("Open department")],
        timestamp: new Date().toISOString(),
      };
      break;
    }
  }

  if (/^https?:\/\//i.test(data.url)) embed.url = data.url;
  return embed;
}
