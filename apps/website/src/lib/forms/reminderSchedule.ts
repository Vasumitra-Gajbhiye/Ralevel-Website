export function getISTCalendarDayParts(date: Date): {
  year: number;
  month: number;
  day: number;
} {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [year, month, day] = formatter.format(date).split("-").map(Number);
  return { year, month, day };
}

export function istCalendarDaysSince(
  from: Date,
  to: Date = new Date(),
): number {
  const start = getISTCalendarDayParts(from);
  const end = getISTCalendarDayParts(to);
  const startUtc = Date.UTC(start.year, start.month - 1, start.day);
  const endUtc = Date.UTC(end.year, end.month - 1, end.day);
  return Math.round((endUtc - startUtc) / (24 * 60 * 60 * 1000));
}

export type ReminderTier = 3 | 5 | 7;

export function pickReminderTier(input: {
  daysSinceSubmission: number;
  reminderPings?: {
    day3?: Date | string | null;
    day5?: Date | string | null;
    day7?: Date | string | null;
  };
}): ReminderTier | null {
  const { daysSinceSubmission, reminderPings } = input;

  if (daysSinceSubmission >= 3 && !reminderPings?.day3) return 3;
  if (daysSinceSubmission >= 5 && !reminderPings?.day5) return 5;
  if (daysSinceSubmission >= 7 && !reminderPings?.day7) return 7;
  return null;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
