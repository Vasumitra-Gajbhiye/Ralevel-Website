/**
 * Small recurrence engine for repeating tasks. Rules are plain JSON and work on
 * IST day keys, so all-day dates never drift across time zones.
 *
 * Completing a repeating task moves its due date to the next occurrence after
 * today (Todoist's "every" behaviour) instead of creating a copy.
 */
import {
  addDays,
  daysInMonth,
  dayKeyFromParts,
  parseDayKey,
  weekdayOf,
} from "./dates";

export type RecurrenceFreq = "day" | "week" | "month" | "year";

export type Recurrence = {
  freq: RecurrenceFreq;
  interval: number;
  /** freq "week": days of the week, 0 = Sunday … 6 = Saturday. */
  weekdays?: number[];
  /** freq "month" | "year": day of the month (clamped in short months). */
  monthDay?: number;
  /** freq "year": month 1–12. */
  month?: number;
  /** freq "day": Monday–Friday only. */
  workdays?: boolean;
};

const MAX_STEPS = 1000;

/** ISO weekday: Monday = 1 … Sunday = 7. */
const iso = (weekday: number) => (weekday === 0 ? 7 : weekday);

const isWorkday = (key: string) => {
  const wd = weekdayOf(key);
  return wd >= 1 && wd <= 5;
};

function clampedDay(year: number, month: number, monthDay: number): string {
  return dayKeyFromParts(year, month, Math.min(monthDay, daysInMonth(year, month)));
}

function addMonthsTo(year: number, month: number, months: number) {
  const index = year * 12 + (month - 1) + months;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

/** Fills rule details from the due date so later occurrences stay anchored. */
export function normalizeRecurrence(rule: Recurrence, dueOn: string): Recurrence {
  const { month, day } = parseDayKey(dueOn);
  const interval = Math.max(1, Math.min(365, Math.floor(rule.interval || 1)));
  switch (rule.freq) {
    case "day":
      return rule.workdays ? { freq: "day", interval: 1, workdays: true } : { freq: "day", interval };
    case "week": {
      const weekdays = [...new Set(rule.weekdays ?? [])].filter((d) => d >= 0 && d <= 6);
      return { freq: "week", interval, weekdays: weekdays.length ? weekdays.sort() : [weekdayOf(dueOn)] };
    }
    case "month":
      return { freq: "month", interval, monthDay: rule.monthDay ?? day };
    case "year":
      return { freq: "year", interval, month: rule.month ?? month, monthDay: rule.monthDay ?? day };
  }
}

/** Whether `key` is a day the rule can land on (ignores the interval). */
export function matchesRule(rule: Recurrence, key: string): boolean {
  const { month, year } = parseDayKey(key);
  switch (rule.freq) {
    case "day":
      return rule.workdays ? isWorkday(key) : true;
    case "week":
      return !rule.weekdays?.length || rule.weekdays.includes(weekdayOf(key));
    case "month":
      return rule.monthDay == null || clampedDay(year, month, rule.monthDay) === key;
    case "year":
      return (
        (rule.month == null || rule.month === month) &&
        (rule.monthDay == null || clampedDay(year, month, rule.monthDay) === key)
      );
  }
}

/** The next occurrence strictly after `fromKey`, counting the interval from it. */
export function nextOccurrence(rule: Recurrence, fromKey: string): string {
  const { year, month, day } = parseDayKey(fromKey);
  const interval = Math.max(1, rule.interval || 1);

  switch (rule.freq) {
    case "day": {
      if (!rule.workdays) return addDays(fromKey, interval);
      let next = addDays(fromKey, 1);
      while (!isWorkday(next)) next = addDays(next, 1);
      return next;
    }
    case "week": {
      const days = [...new Set((rule.weekdays ?? []).map(iso))].sort((a, b) => a - b);
      if (!days.length) return addDays(fromKey, 7 * interval);
      const current = iso(weekdayOf(fromKey));
      const later = days.find((d) => d > current);
      if (later) return addDays(fromKey, later - current);
      const weekStart = addDays(fromKey, -(current - 1));
      return addDays(weekStart, 7 * interval + (days[0] - 1));
    }
    case "month": {
      const monthDay = rule.monthDay ?? day;
      const thisMonth = clampedDay(year, month, monthDay);
      if (thisMonth > fromKey) return thisMonth;
      const next = addMonthsTo(year, month, interval);
      return clampedDay(next.year, next.month, monthDay);
    }
    case "year": {
      const targetMonth = rule.month ?? month;
      const monthDay = rule.monthDay ?? day;
      const thisYear = clampedDay(year, targetMonth, monthDay);
      if (thisYear > fromKey) return thisYear;
      return clampedDay(year + interval, targetMonth, monthDay);
    }
  }
}

/** First due date for a new repeating task: today if it matches, else the next one. */
export function firstOccurrence(rule: Recurrence, todayKey: string): string {
  return matchesRule(rule, todayKey) ? todayKey : nextOccurrence(rule, todayKey);
}

/**
 * Due date after completing an occurrence due on `dueOn`: the first occurrence
 * after both `dueOn` and today, so overdue repeats skip missed days.
 */
export function nextDueAfterCompletion(rule: Recurrence, dueOn: string, todayKey: string): string {
  let next = nextOccurrence(rule, dueOn);
  for (let i = 0; i < MAX_STEPS && next <= todayKey; i++) {
    next = nextOccurrence(rule, next);
  }
  return next;
}

/* --------------------------------- Parsing -------------------------------- */

const WEEKDAY_PATTERNS: [RegExp, number][] = [
  [/^sun(day)?$/, 0],
  [/^mon(day)?$/, 1],
  [/^tue(s(day)?)?$/, 2],
  [/^wed(nesday)?$/, 3],
  [/^thu(r(s(day)?)?)?$/, 4],
  [/^fri(day)?$/, 5],
  [/^sat(urday)?$/, 6],
];

const WD = String.raw`(?:mon(?:day)?|tue(?:s(?:day)?)?|wed(?:nesday)?|thu(?:r(?:s(?:day)?)?)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)`;
const ORDINAL = String.raw`(\d{1,2})(?:st|nd|rd|th)?`;

function weekdayNumber(token: string): number | null {
  const t = token.toLowerCase();
  for (const [re, n] of WEEKDAY_PATTERNS) if (re.test(t)) return n;
  return null;
}

type Matcher = { re: RegExp; build: (m: RegExpExecArray) => Recurrence | null };

const toInterval = (other: string | undefined, n: string | undefined) =>
  other ? 2 : n ? Number(n) : 1;

const MATCHERS: Matcher[] = [
  {
    re: /\bevery\s+(?:work\s?day|weekday)s?\b/i,
    build: () => ({ freq: "day", interval: 1, workdays: true }),
  },
  {
    re: new RegExp(String.raw`\bevery\s+(other\s+)?(${WD}(?:\s*(?:,|and|&)\s*${WD})*)\b`, "i"),
    build: (m) => {
      const weekdays = m[2]
        .split(/\s*(?:,|and|&)\s*/i)
        .map(weekdayNumber)
        .filter((n): n is number => n !== null);
      return weekdays.length ? { freq: "week", interval: m[1] ? 2 : 1, weekdays } : null;
    },
  },
  {
    re: new RegExp(String.raw`\bevery\s+month\s+on\s+the\s+${ORDINAL}\b`, "i"),
    build: (m) => monthDayRule(m[1]),
  },
  {
    re: new RegExp(String.raw`\bevery\s+${ORDINAL}(?:\s+of\s+the\s+month)?\b(?!\s*(?:days?|weeks?|months?|years?)\b)`, "i"),
    build: (m) => (/(st|nd|rd|th)/i.test(m[0]) || /of the month/i.test(m[0]) ? monthDayRule(m[1]) : null),
  },
  {
    re: /\bevery\s+(?:(other)\s+|(\d{1,3})\s+)?(day|week|month|year)s?\b/i,
    build: (m) => ({
      freq: m[3].toLowerCase() as RecurrenceFreq,
      interval: toInterval(m[1], m[2]),
    }),
  },
];

/** Single words like "weekly" are too common in titles; only the Repeat field accepts them. */
const LOOSE_MATCHERS: Matcher[] = [
  { re: /\bdaily\b/i, build: () => ({ freq: "day", interval: 1 }) },
  { re: /\bweekdays\b/i, build: () => ({ freq: "day", interval: 1, workdays: true }) },
  { re: /\bweekly\b/i, build: () => ({ freq: "week", interval: 1 }) },
  { re: /\bfortnightly\b/i, build: () => ({ freq: "week", interval: 2 }) },
  { re: /\bmonthly\b/i, build: () => ({ freq: "month", interval: 1 }) },
  { re: /\b(?:yearly|annually)\b/i, build: () => ({ freq: "year", interval: 1 }) },
];

function monthDayRule(raw: string): Recurrence | null {
  const n = Number(raw);
  return n >= 1 && n <= 31 ? { freq: "month", interval: 1, monthDay: n } : null;
}

/**
 * Finds a recurrence phrase in free text ("every mon, thu", "every 15th").
 * `loose` also accepts single words like "weekly", for the Repeat field.
 */
export function parseRecurrence(
  text: string,
  { loose = false }: { loose?: boolean } = {},
): { rule: Recurrence; start: number; end: number; text: string } | null {
  let best: { rule: Recurrence; start: number; end: number; text: string } | null = null;
  for (const { re, build } of loose ? [...MATCHERS, ...LOOSE_MATCHERS] : MATCHERS) {
    const m = re.exec(text);
    if (!m) continue;
    const rule = build(m);
    if (!rule) continue;
    const candidate = { rule, start: m.index, end: m.index + m[0].length, text: m[0] };
    // Prefer the longest (most specific) match, then the earliest.
    const length = candidate.end - candidate.start;
    const bestLength = best ? best.end - best.start : -1;
    if (!best || length > bestLength || (length === bestLength && candidate.start < best.start)) {
      best = candidate;
    }
  }
  return best;
}

/* -------------------------------- Formatting ------------------------------- */

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function ordinal(n: number): string {
  const s = n % 100 >= 11 && n % 100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th";
  return `${n}${s}`;
}

function every(interval: number, unit: string): string {
  if (interval === 1) return `Every ${unit}`;
  if (interval === 2) return `Every other ${unit}`;
  return `Every ${interval} ${unit}s`;
}

export function formatRecurrence(rule: Recurrence): string {
  switch (rule.freq) {
    case "day":
      return rule.workdays ? "Every weekday" : every(rule.interval, "day");
    case "week": {
      const days = [...(rule.weekdays ?? [])].sort((a, b) => iso(a) - iso(b));
      if (!days.length) return every(rule.interval, "week");
      const list = days.map((d) => DAY_NAMES[d]).join(", ");
      return rule.interval === 1 ? `Every ${list}` : `${every(rule.interval, "week")} on ${list}`;
    }
    case "month":
      return rule.monthDay
        ? `${every(rule.interval, "month")} on the ${ordinal(rule.monthDay)}`
        : every(rule.interval, "month");
    case "year":
      return rule.month && rule.monthDay
        ? `${every(rule.interval, "year")} on ${rule.monthDay} ${MONTH_NAMES[rule.month - 1]}`
        : every(rule.interval, "year");
  }
}
