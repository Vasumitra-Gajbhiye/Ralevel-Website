import { format, isValid, parse } from "date-fns";

/** e.g. "2026-06-26" → "26 jun 2026", "2026-01-01" → "1 jan 2026" */
export function formatBlogDisplayDate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  let date = parse(trimmed, "yyyy-MM-dd", new Date());
  if (!isValid(date)) {
    date = new Date(trimmed);
  }
  if (!isValid(date)) return trimmed;

  const day = format(date, "d");
  const month = format(date, "MMM").toLowerCase();
  const year = format(date, "yyyy");
  return `${day} ${month} ${year}`;
}

/** e.g. "2026-06-17" → "Jun 17, 2026" */
export function formatBlogMediumDate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  let date = parse(trimmed, "yyyy-MM-dd", new Date());
  if (!isValid(date)) {
    date = new Date(trimmed);
  }
  if (!isValid(date)) return trimmed;

  return format(date, "MMM d, yyyy");
}
