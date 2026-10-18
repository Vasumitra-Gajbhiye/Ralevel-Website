import { describe, expect, it } from "vitest";
import { parseQuickAdd } from "../quickAdd";

// Sunday 18 Oct 2026, 10:00 IST.
const now = new Date("2026-10-18T04:30:00Z");
const members = [
  { id: "u1", nickname: "aishak", name: "Aisha Khan" },
  { id: "u2", nickname: "benc", name: "Ben Carter" },
];
const lists = [
  { id: "l1", name: "Launch plan" },
  { id: "l2", name: "Weekly posts" },
];

describe("parseQuickAdd", () => {
  it("parses the full Todoist-style example", () => {
    const r = parseQuickAdd("Post update fri 5pm p1 @aishak", { now, members });
    expect(r.title).toBe("Post update");
    expect(r.dueOn).toBe("2026-10-23");
    expect(r.dueTime).toBe("17:00");
    expect(r.priority).toBe(1);
    expect(r.assigneeId).toBe("u1");
    expect(r.tokens.map((t) => t.kind)).toEqual(["date", "priority", "assignee"]);
  });

  it("recurrence sets the first occurrence", () => {
    const r = parseQuickAdd("Weekly report every monday", { now });
    expect(r.title).toBe("Weekly report");
    expect(r.recurrence).toEqual({ freq: "week", interval: 1, weekdays: [1] });
    expect(r.dueOn).toBe("2026-10-19");
    expect(r.dueTime).toBeNull();
  });

  it("a title word like 'Weekly' alone does not make a task repeat", () => {
    const r = parseQuickAdd("Weekly report", { now });
    expect(r.recurrence).toBeNull();
    expect(r.title).toBe("Weekly report");
  });

  it("recurrence with a time keeps the occurrence day", () => {
    const r = parseQuickAdd("Standup every weekday 9:30am", { now });
    expect(r.title).toBe("Standup");
    expect(r.recurrence).toEqual({ freq: "day", interval: 1, workdays: true });
    expect(r.dueOn).toBe("2026-10-19");
    expect(r.dueTime).toBe("09:30");
  });

  it("relative dates use IST", () => {
    expect(parseQuickAdd("Call tomorrow", { now }).dueOn).toBe("2026-10-19");
    expect(parseQuickAdd("Call today", { now }).dueOn).toBe("2026-10-18");
    // 23:50 IST on the 18th: "tomorrow" is still the 19th.
    const late = new Date("2026-10-18T18:20:00Z");
    expect(parseQuickAdd("Call tomorrow", { now: late }).dueOn).toBe("2026-10-19");
  });

  it("matches lists by prefix", () => {
    const r = parseQuickAdd("Draft copy #launch", { now, lists });
    expect(r.listId).toBe("l1");
    expect(r.title).toBe("Draft copy");
  });

  it("keeps unknown @handles in the title and warns", () => {
    const r = parseQuickAdd("Ping @nobody", { now, members });
    expect(r.assigneeId).toBeNull();
    expect(r.title).toBe("Ping @nobody");
    expect(r.warnings).toHaveLength(1);
  });

  it("ignoring a token kind keeps the words in the title", () => {
    const r = parseQuickAdd("Plan the May meetup", { now, ignore: ["date"] });
    expect(r.dueOn).toBeNull();
    expect(r.title).toBe("Plan the May meetup");
  });

  it("plain titles stay untouched", () => {
    const r = parseQuickAdd("Write 15 posts", { now });
    expect(r).toMatchObject({ title: "Write 15 posts", dueOn: null, priority: null, recurrence: null });
  });

  it("priority must be a whole word", () => {
    expect(parseQuickAdd("Fix p1x bug", { now }).priority).toBeNull();
    expect(parseQuickAdd("p2 Fix bug", { now }).priority).toBe(2);
  });
});
