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
