/**
 * Date helpers for /tasks. The org works in IST (UTC+05:30, no DST), so due
 * dates are stored as IST calendar days ("YYYY-MM-DD") plus an optional exact
 * instant when a time was set. Day keys compare correctly as strings.
 */

export const IST_OFFSET_MIN = 330;
const IST_OFFSET_MS = IST_OFFSET_MIN * 60_000;
const DAY_MS = 86_400_000;

const DAY_KEY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

const pad = (n: number) => String(n).padStart(2, "0");

export function isDayKey(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const m = DAY_KEY_RE.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}

export function parseDayKey(key: string): { year: number; month: number; day: number } {
  const m = DAY_KEY_RE.exec(key);
  if (!m) throw new Error(`Invalid day key: ${key}`);
  return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
}

export function dayKeyFromParts(year: number, month: number, day: number): string {
  const date = new Date(Date.UTC(year, month - 1, day));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

const keyToUtcMs = (key: string) => {
  const { year, month, day } = parseDayKey(key);
  return Date.UTC(year, month - 1, day);
};

/** IST calendar day of an instant. */
export function istDayKey(date: Date): string {
  const shifted = new Date(date.getTime() + IST_OFFSET_MS);
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`;
}

export function istTodayKey(now: Date = new Date()): string {
  return istDayKey(now);
}

export function addDays(key: string, days: number): string {
  const date = new Date(keyToUtcMs(key) + days * DAY_MS);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function daysBetween(from: string, to: string): number {
  return Math.round((keyToUtcMs(to) - keyToUtcMs(from)) / DAY_MS);
}

/** 0 = Sunday … 6 = Saturday. */
export function weekdayOf(key: string): number {
  return new Date(keyToUtcMs(key)).getUTCDay();
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** The instant for an IST wall-clock time ("HH:mm") on an IST day. */
export function instantFromIst(key: string, time: string): Date {
  const { year, month, day } = parseDayKey(key);
  const [h, mi] = time.split(":").map(Number);
  return new Date(Date.UTC(year, month - 1, day, h || 0, mi || 0) - IST_OFFSET_MS);
}

/** IST wall-clock time of an instant, "HH:mm". */
export function istTimeOf(date: Date): string {
  const shifted = new Date(date.getTime() + IST_OFFSET_MS);
  return `${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}`;
}

const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatTime12(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hour}:${pad(m)} ${suffix}` : `${hour} ${suffix}`;
}

export function formatShortDate(key: string, todayKey?: string): string {
  const { year, month, day } = parseDayKey(key);
  const sameYear = !todayKey || parseDayKey(todayKey).year === year;
  return `${day} ${MONTHS_SHORT[month - 1]}${sameYear ? "" : ` ${year}`}`;
}

export type DueTone = "overdue" | "today" | "tomorrow" | "soon" | "later";

export function dueTone(dueOn: string, todayKey: string, dueAt?: Date | string | null, now?: Date): DueTone {
  const diff = daysBetween(todayKey, dueOn);
  if (diff < 0) return "overdue";
  if (diff === 0) {
    if (dueAt && now && new Date(dueAt).getTime() < now.getTime()) return "overdue";
    return "today";
  }
  if (diff === 1) return "tomorrow";
  if (diff < 7) return "soon";
  return "later";
}

/** "Today 5 PM", "Tomorrow", "Fri", "Yesterday", "24 Oct", "3 Jan 2027". */
export function formatDue(
  dueOn: string,
  dueAt: Date | string | null | undefined,
  todayKey: string,
): string {
  const diff = daysBetween(todayKey, dueOn);
  let label: string;
  if (diff === 0) label = "Today";
  else if (diff === 1) label = "Tomorrow";
  else if (diff === -1) label = "Yesterday";
  else if (diff > 1 && diff < 7) label = WEEKDAYS_SHORT[weekdayOf(dueOn)];
  else label = formatShortDate(dueOn, todayKey);
  if (dueAt) label += ` ${formatTime12(istTimeOf(new Date(dueAt)))}`;
  return label;
}

/** Day heading for grouped views: "Today · Sat 18 Oct". */
export function formatDayHeading(key: string, todayKey: string): string {
  const diff = daysBetween(todayKey, key);
  const base = `${WEEKDAYS_SHORT[weekdayOf(key)]} ${formatShortDate(key, todayKey)}`;
  if (diff === 0) return `Today · ${base}`;
  if (diff === 1) return `Tomorrow · ${base}`;
  return `${WEEKDAYS_LONG[weekdayOf(key)]} · ${formatShortDate(key, todayKey)}`;
}
