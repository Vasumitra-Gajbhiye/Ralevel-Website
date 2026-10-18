import { describe, expect, it } from "vitest";
import {
  addDays,
  daysBetween,
  dueTone,
  formatDue,
  instantFromIst,
  isDayKey,
  istDayKey,
  istTimeOf,
  weekdayOf,
} from "../dates";

describe("IST day keys", () => {
  it("uses the IST calendar day around midnight", () => {
    // 18:29 UTC = 23:59 IST, 18:30 UTC = 00:00 IST next day.
    expect(istDayKey(new Date("2026-10-18T18:29:00Z"))).toBe("2026-10-18");
    expect(istDayKey(new Date("2026-10-18T18:30:00Z"))).toBe("2026-10-19");
  });

  it("round-trips wall-clock times", () => {
    const at = instantFromIst("2026-10-23", "17:00");
    expect(at.toISOString()).toBe("2026-10-23T11:30:00.000Z");
    expect(istTimeOf(at)).toBe("17:00");
  });

  it("does day arithmetic across months and years", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2028-03-01", -1)).toBe("2028-02-29");
    expect(daysBetween("2026-10-18", "2026-11-01")).toBe(14);
    expect(weekdayOf("2026-10-18")).toBe(0);
  });

  it("validates keys", () => {
    expect(isDayKey("2026-02-28")).toBe(true);
    expect(isDayKey("2026-02-30")).toBe(false);
    expect(isDayKey("26-2-3")).toBe(false);
  });
});

describe("formatDue", () => {
  const today = "2026-10-18"; // Sunday

  it("labels relative days", () => {
    expect(formatDue("2026-10-18", null, today)).toBe("Today");
    expect(formatDue("2026-10-19", null, today)).toBe("Tomorrow");
    expect(formatDue("2026-10-17", null, today)).toBe("Yesterday");
    expect(formatDue("2026-10-23", null, today)).toBe("Fri");
    expect(formatDue("2026-11-24", null, today)).toBe("24 Nov");
    expect(formatDue("2027-01-03", null, today)).toBe("3 Jan 2027");
  });

  it("appends the IST time", () => {
    expect(formatDue("2026-10-18", instantFromIst("2026-10-18", "17:00"), today)).toBe("Today 5 PM");
    expect(formatDue("2026-10-19", instantFromIst("2026-10-19", "09:30"), today)).toBe("Tomorrow 9:30 AM");
  });

  it("tones", () => {
    expect(dueTone("2026-10-17", today)).toBe("overdue");
    expect(dueTone("2026-10-18", today)).toBe("today");
    const now = new Date("2026-10-18T12:00:00Z");
    expect(dueTone("2026-10-18", today, instantFromIst(today, "09:00"), now)).toBe("overdue");
  });
});
