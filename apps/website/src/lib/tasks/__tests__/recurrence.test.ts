import { describe, expect, it } from "vitest";
import {
  firstOccurrence,
  formatRecurrence,
  nextDueAfterCompletion,
  nextOccurrence,
  normalizeRecurrence,
  parseRecurrence,
  type Recurrence,
} from "../recurrence";

// 2026-10-18 is a Sunday.
const SUN = "2026-10-18";

describe("nextOccurrence", () => {
  it("daily and every N days", () => {
    expect(nextOccurrence({ freq: "day", interval: 1 }, SUN)).toBe("2026-10-19");
    expect(nextOccurrence({ freq: "day", interval: 3 }, SUN)).toBe("2026-10-21");
  });

  it("weekdays skip the weekend", () => {
    const rule: Recurrence = { freq: "day", interval: 1, workdays: true };
    expect(nextOccurrence(rule, "2026-10-16")).toBe("2026-10-19"); // Fri -> Mon
    expect(nextOccurrence(rule, SUN)).toBe("2026-10-19");
    expect(nextOccurrence(rule, "2026-10-19")).toBe("2026-10-20");
  });

  it("weekly on several days", () => {
    const rule: Recurrence = { freq: "week", interval: 1, weekdays: [1, 4] }; // Mon, Thu
    expect(nextOccurrence(rule, "2026-10-19")).toBe("2026-10-22"); // Mon -> Thu
    expect(nextOccurrence(rule, "2026-10-22")).toBe("2026-10-26"); // Thu -> Mon
    expect(nextOccurrence(rule, SUN)).toBe("2026-10-19"); // Sun -> Mon (ISO week ends Sunday)
  });

  it("every other week", () => {
    const rule: Recurrence = { freq: "week", interval: 2, weekdays: [1] };
    expect(nextOccurrence(rule, "2026-10-19")).toBe("2026-11-02");
  });

  it("monthly clamps to short months without drifting", () => {
    const rule: Recurrence = { freq: "month", interval: 1, monthDay: 31 };
    expect(nextOccurrence(rule, "2027-01-31")).toBe("2027-02-28");
    expect(nextOccurrence(rule, "2027-02-28")).toBe("2027-03-31");
    expect(nextOccurrence(rule, "2028-01-31")).toBe("2028-02-29"); // leap year
  });

  it("monthly mid-month and year rollover", () => {
    const rule: Recurrence = { freq: "month", interval: 1, monthDay: 15 };
    expect(nextOccurrence(rule, "2026-10-10")).toBe("2026-10-15");
    expect(nextOccurrence(rule, "2026-12-15")).toBe("2027-01-15");
  });

  it("yearly, including 29 Feb", () => {
    expect(nextOccurrence({ freq: "year", interval: 1, month: 2, monthDay: 29 }, "2028-02-29")).toBe("2029-02-28");
    expect(nextOccurrence({ freq: "year", interval: 1, month: 1, monthDay: 3 }, SUN)).toBe("2027-01-03");
  });
});

describe("completion", () => {
  it("an overdue daily task moves to tomorrow, not to a missed day", () => {
    expect(nextDueAfterCompletion({ freq: "day", interval: 1 }, "2026-10-10", SUN)).toBe("2026-10-19");
  });

  it("completing early advances one occurrence", () => {
    const weekly: Recurrence = { freq: "week", interval: 1, weekdays: [5] };
    expect(nextDueAfterCompletion(weekly, "2026-10-23", SUN)).toBe("2026-10-30");
  });

  it("first occurrence is today when today matches", () => {
    expect(firstOccurrence({ freq: "week", interval: 1, weekdays: [0] }, SUN)).toBe(SUN);
    expect(firstOccurrence({ freq: "week", interval: 1, weekdays: [1] }, SUN)).toBe("2026-10-19");
    expect(firstOccurrence({ freq: "day", interval: 1, workdays: true }, SUN)).toBe("2026-10-19");
  });
});

describe("normalizeRecurrence", () => {
  it("anchors to the due date", () => {
    expect(normalizeRecurrence({ freq: "week", interval: 1 }, "2026-10-23")).toEqual({ freq: "week", interval: 1, weekdays: [5] });
    expect(normalizeRecurrence({ freq: "month", interval: 1 }, "2026-10-31")).toEqual({ freq: "month", interval: 1, monthDay: 31 });
    expect(normalizeRecurrence({ freq: "year", interval: 1 }, "2026-10-31")).toEqual({ freq: "year", interval: 1, month: 10, monthDay: 31 });
  });
});

describe("parseRecurrence", () => {
  const rule = (text: string) => parseRecurrence(text)?.rule;

  it("understands common phrases", () => {
    expect(rule("standup every day")).toEqual({ freq: "day", interval: 1 });
    expect(rule("every weekday")).toEqual({ freq: "day", interval: 1, workdays: true });
    expect(rule("every 3 days")).toEqual({ freq: "day", interval: 3 });
    expect(rule("every other week")).toEqual({ freq: "week", interval: 2 });
    expect(rule("every monday")).toEqual({ freq: "week", interval: 1, weekdays: [1] });
    expect(rule("every mon, thu")).toEqual({ freq: "week", interval: 1, weekdays: [1, 4] });
    expect(rule("every tue and fri")).toEqual({ freq: "week", interval: 1, weekdays: [2, 5] });
    expect(rule("every other friday")).toEqual({ freq: "week", interval: 2, weekdays: [5] });
    expect(rule("every 15th")).toEqual({ freq: "month", interval: 1, monthDay: 15 });
    expect(rule("every month on the 1st")).toEqual({ freq: "month", interval: 1, monthDay: 1 });
    expect(rule("every 2 months")).toEqual({ freq: "month", interval: 2 });
  });

  it("accepts single words only in loose mode", () => {
    expect(rule("Weekly report")).toBeUndefined();
    expect(parseRecurrence("weekly", { loose: true })?.rule).toEqual({ freq: "week", interval: 1 });
    expect(parseRecurrence("yearly", { loose: true })?.rule).toEqual({ freq: "year", interval: 1 });
    expect(parseRecurrence("weekly every mon, thu", { loose: true })?.text).toBe("every mon, thu");
  });

  it("reports the matched span", () => {
    const found = parseRecurrence("Post update every monday p1");
    expect(found?.text).toBe("every monday");
    expect(found?.start).toBe(12);
  });

  it("ignores text without a recurrence", () => {
    expect(parseRecurrence("Review everything by friday")).toBeNull();
    expect(parseRecurrence("Write 15 posts")).toBeNull();
  });
});

describe("formatRecurrence", () => {
  it("reads naturally", () => {
    expect(formatRecurrence({ freq: "day", interval: 1 })).toBe("Every day");
    expect(formatRecurrence({ freq: "day", interval: 1, workdays: true })).toBe("Every weekday");
    expect(formatRecurrence({ freq: "week", interval: 1, weekdays: [4, 1] })).toBe("Every Mon, Thu");
    expect(formatRecurrence({ freq: "week", interval: 2, weekdays: [5] })).toBe("Every other week on Fri");
    expect(formatRecurrence({ freq: "month", interval: 1, monthDay: 22 })).toBe("Every month on the 22nd");
    expect(formatRecurrence({ freq: "year", interval: 1, month: 1, monthDay: 3 })).toBe("Every year on 3 Jan");
  });
});
