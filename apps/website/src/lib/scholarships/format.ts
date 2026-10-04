import { ANY_COUNTRY } from "./constants";
import { countryName } from "./countries";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Date → "YYYY-MM-DD" (UTC), or null. */
export function toDateString(value: unknown): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

/** "YYYY-MM-DD" → Date at UTC midnight, or undefined for "". */
export function fromDateString(value: string): Date | undefined {
  return value ? new Date(`${value}T00:00:00Z`) : undefined;
}

export function todayUtc(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

// Formatting in UTC keeps server and browser output identical.
const SHORT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const LONG = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "14 Jan", or "14 Jan 2027" when not in the current year (or `withYear`). */
export function formatDate(
  value: string | null,
  { withYear = false, now = new Date() }: { withYear?: boolean; now?: Date } = {},
): string {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00Z`);
  const sameYear = date.getUTCFullYear() === now.getUTCFullYear();
  return (withYear || !sameYear ? LONG : SHORT).format(date);
}

export function formatDestinations(codes: string[], max = 2): string {
  if (codes.length === 0) return "";
  if (codes.includes(ANY_COUNTRY)) return "Any country";
  const names = codes.map(countryName);
  if (names.length <= max) return names.join(", ");
  return `${names.slice(0, max).join(", ")} +${names.length - max}`;
}

/** 72000 → "$72k" */
export function formatUsdShort(value: number | null): string {
  if (value === null || value === undefined) return "";
  if (value >= 1000) return `$${Math.round(value / 1000)}k`;
  return `$${value}`;
}

export function formatUsd(value: number | null): string {
  if (value === null || value === undefined) return "";
  return `$${value.toLocaleString("en-US")}`;
}
