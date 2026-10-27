/**
 * /tasks notifications: a DM when someone is assigned a task, review and
 * reward DMs for tasks with stars, and a daily digest of tasks due today or
 * overdue (run by cron at 09:00 IST).
 */
import {
  formatTaskAssignedEmbed,
  formatTaskDigestEmbed,
  formatTaskEventEmbed,
  sendDirectMessage,
  type TaskAssignedNotification,
  type TaskDigestItem,
  type TaskEventNotification,
} from "@ralevel/discord";
import mongoose from "mongoose";
import { isDiscordNotificationsEnabled, normalizeSiteUrl } from "../config.js";
import connectDB from "../db.js";
import Task from "../models/Task.js";
import TaskDigestLog from "../models/TaskDigestLog.js";
import TaskList from "../models/TaskList.js";
import UserData from "../models/UserData.js";
import { getISTCalendarDayParts, sleep } from "./reminderSchedule.js";

const DIGEST_DELAY_MS = 400;
const DIGEST_ITEMS = 10;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export type TaskAssignedPayload = TaskAssignedNotification & { discordUserId: string };

function botToken(): string | null {
  if (!isDiscordNotificationsEnabled()) return null;
  const token = process.env.DISCORD_BOT_TOKEN?.trim();
  if (!token) {
    console.warn("[tasks] notifications enabled but DISCORD_BOT_TOKEN is missing");
    return null;
  }
  return token;
}

function siteUrl(): string {
  return normalizeSiteUrl(process.env.NEXT_PUBLIC_URL ?? process.env.SITE_URL);
}

export async function handleTaskAssigned(
  data: TaskAssignedPayload,
): Promise<{ ok: true; skipped?: boolean }> {
  const token = botToken();
  if (!token || !data.discordUserId) return { ok: true, skipped: true };
  const { discordUserId, ...notification } = data;
  await sendDirectMessage(token, discordUserId, { embeds: [formatTaskAssignedEmbed(notification)] });
  return { ok: true };
}

export type TaskEventPayload = { discordUserIds: string[]; event: TaskEventNotification };

const EVENT_DM_DELAY_MS = 300;
const EVENT_MAX_RECIPIENTS = 10;

/** One review/reward DM to each recipient; a failed DM doesn't stop the rest. */
export async function handleTaskEvent(
  data: TaskEventPayload,
): Promise<{ ok: true; sent: number; skipped?: boolean }> {
  const token = botToken();
  const recipients = [...new Set(data.discordUserIds ?? [])].filter(Boolean).slice(0, EVENT_MAX_RECIPIENTS);
  if (!token || !recipients.length || !data.event) return { ok: true, sent: 0, skipped: true };

  const embed = formatTaskEventEmbed(data.event);
  let sent = 0;
  for (const [i, discordUserId] of recipients.entries()) {
    if (i > 0) await sleep(EVENT_DM_DELAY_MS);
    try {
      await sendDirectMessage(token, discordUserId, { embeds: [embed] });
      sent += 1;
    } catch (err) {
      console.error(`[tasks] ${data.event.kind} DM failed for ${discordUserId}:`, err);
    }
  }
  return { ok: true, sent };
}

function istTodayKey(): string {
  const { year, month, day } = getISTCalendarDayParts(new Date());
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function istTime(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(date)
    .toUpperCase();
}

function dueLabel(dueOn: string, dueAt: Date | null, todayKey: string): string {
  if (dueOn < todayKey) {
    const [, m, d] = dueOn.split("-").map(Number);
    return `overdue since ${d} ${MONTHS[m - 1]}`;
  }
  return dueAt ? `today ${istTime(new Date(dueAt))}` : "today";
}

type DigestRow = {
  _id: mongoose.Types.ObjectId;
  overdue: number;
  today: number;
  items: { id: mongoose.Types.ObjectId; title: string; listId: mongoose.Types.ObjectId; dueOn: string; dueAt: Date | null }[];
};

type DigestResult = { processed: number; sent: number; skipped: number; errors: number };

export async function processTaskDigest(): Promise<DigestResult> {
  const result: DigestResult = { processed: 0, sent: 0, skipped: 0, errors: 0 };
  const token = botToken();
  if (!token) return result;

  await connectDB();
  const todayKey = istTodayKey();

  const rows = await Task.aggregate<DigestRow>([
    { $match: { parentId: null, completedAt: null, dueOn: { $ne: null, $lte: todayKey } } },
    { $addFields: { recipient: { $ifNull: ["$assigneeId", "$ownerId"] } } },
    { $match: { recipient: { $ne: null } } },
    { $sort: { dueOn: 1, priority: 1, dueAt: 1 } },
    {
      $group: {
        _id: "$recipient",
        overdue: { $sum: { $cond: [{ $lt: ["$dueOn", todayKey] }, 1, 0] } },
        today: { $sum: { $cond: [{ $eq: ["$dueOn", todayKey] }, 1, 0] } },
        items: { $push: { id: "$_id", title: "$title", listId: "$listId", dueOn: "$dueOn", dueAt: "$dueAt" } },
      },
    },
    { $project: { overdue: 1, today: 1, items: { $slice: ["$items", DIGEST_ITEMS] } } },
  ]);
  if (!rows.length) return result;

  const users = (await UserData.find({ _id: { $in: rows.map((r) => r._id) } })
    .select("discordUserId roles")
    .lean()) as unknown as { _id: mongoose.Types.ObjectId; discordUserId?: string; roles?: string[] }[];
  const userById = new Map(users.map((u) => [String(u._id), u]));

  const listIds = [...new Set(rows.flatMap((r) => r.items.map((i) => String(i.listId))))];
  const lists = (await TaskList.find({ _id: { $in: listIds } }).select("name").lean()) as unknown as {
    _id: mongoose.Types.ObjectId;
    name: string;
  }[];
  const listName = new Map(lists.map((l) => [String(l._id), l.name]));
  const base = siteUrl();

  for (const row of rows) {
    result.processed += 1;
    const user = userById.get(String(row._id));
    const discordUserId = user?.discordUserId?.trim();
    const isStaff = (user?.roles ?? []).some((role) => role !== "former_staff");
    if (!discordUserId || !isStaff) {
      result.skipped += 1;
      continue;
    }

    // Claim today's slot first; a duplicate key means it was already sent.
    try {
      await TaskDigestLog.create({ userId: row._id, dayKey: todayKey });
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        result.skipped += 1;
        continue;
      }
      throw err;
    }

    const items: TaskDigestItem[] = row.items.map((item) => ({
      title: item.title,
      listName: listName.get(String(item.listId)) ?? "Tasks",
      dueLabel: dueLabel(item.dueOn, item.dueAt, todayKey),
      overdue: item.dueOn < todayKey,
      url: `${base}/tasks/l/${String(item.listId)}?task=${String(item.id)}`,
    }));

    try {
      await sendDirectMessage(token, discordUserId, {
        embeds: [
          formatTaskDigestEmbed({
            overdueCount: row.overdue,
            todayCount: row.today,
            items,
            todayUrl: `${base}/tasks/today`,
          }),
        ],
      });
      result.sent += 1;
    } catch (err) {
      console.error(`[task-digest] failed for user ${String(row._id)}:`, err);
      // Release the slot so a rerun can retry this user.
      await TaskDigestLog.deleteOne({ userId: row._id, dayKey: todayKey }).catch(() => undefined);
      result.errors += 1;
    }
    await sleep(DIGEST_DELAY_MS);
  }

  return result;
}
