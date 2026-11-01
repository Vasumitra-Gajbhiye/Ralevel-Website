import { describe, expect, it } from "vitest";
import type { ResourceCMSSections } from "@/types/resources2";
import {
  contentHash,
  diffCMSSections,
  groupResourceCmsChanges,
  summarizeChanges,
} from "../diff";

const empty: ResourceCMSSections = {
  syllabus: [],
  notes: [],
  worksheets: [],
  tools: [],
  books: [],
  youtubeChannel: [],
  youtubePlaylist: [],
};

const note = (n: number, extra: Record<string, unknown> = {}) => ({
  title: `Chapter ${n}`,
  source: "Save My Exams",
  link: `https://example.com/ch${n}`,
  tags: ["AS"],
  ...extra,
});

const withNotes = (notes: ResourceCMSSections["notes"]) => ({ ...empty, notes });

const grouped = (before: ResourceCMSSections, after: ResourceCMSSections) =>
  groupResourceCmsChanges(diffCMSSections(before, after));

describe("diffCMSSections", () => {
  const base = withNotes([note(1), note(2), note(3), note(4)]);

  it("reports nothing for identical content", () => {
    expect(grouped(base, withNotes([note(1), note(2), note(3), note(4)]))).toEqual([]);
  });

  it("shows one added item when an item is inserted at the top", () => {
    const after = withNotes([note(0), note(1), note(2), note(3), note(4)]);
    expect(grouped(base, after)).toEqual([
      { type: "added", section: "notes", sectionLabel: "Notes", label: "Chapter 0" },
    ]);
  });

  it("shows one removed item when an item is deleted from the middle", () => {
    const after = withNotes([note(1), note(3), note(4)]);
    expect(grouped(base, after)).toEqual([
      { type: "removed", section: "notes", sectionLabel: "Notes", label: "Chapter 2" },
    ]);
  });

  it("pairs an edit with its item even when another item is removed", () => {
    const after = withNotes([note(2, { link: "https://example.com/new" }), note(3), note(4)]);
    expect(grouped(base, after)).toEqual([
      { type: "removed", section: "notes", sectionLabel: "Notes", label: "Chapter 1" },
      {
        type: "modified",
        section: "notes",
        sectionLabel: "Notes",
        label: "Chapter 2",
        fields: [
          {
            field: "link",
            fieldLabel: "Link",
            before: "https://example.com/ch2",
            after: "https://example.com/new",
          },
        ],
      },
    ]);
  });

  it("keeps a renamed item as an edit when its link is unchanged", () => {
    const after = withNotes([note(1), note(2, { title: "Kinematics" }), note(3), note(4)]);
    const changes = grouped(base, after);
    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({ type: "modified", label: "Kinematics" });
  });

  it("shows a fully replaced item as removed and added", () => {
    const after = withNotes([
      note(1),
      { title: "Something else", link: "https://other.example.com", tags: [] },
      note(3),
      note(4),
    ]);
    expect(grouped(base, after).map((c) => c.type)).toEqual(["removed", "added"]);
  });

  it("ignores whitespace, empty tags and Mongo ids", () => {
    const after = withNotes([
      { ...note(1), title: "  Chapter 1 ", _id: "abc" } as ResourceCMSSections["notes"][number],
      { ...note(2), tags: ["AS", " "] },
      note(3),
      note(4),
    ]);
    expect(grouped(base, after)).toEqual([]);
    expect(contentHash(after)).toBe(contentHash(base));
  });

  it("diffs each section separately", () => {
    const after: ResourceCMSSections = {
      ...base,
      tools: [{ name: "Desmos", url: "https://desmos.com" }],
    };
    expect(grouped(base, after)).toEqual([
      { type: "added", section: "tools", sectionLabel: "Tools", label: "Desmos" },
    ]);
  });

  it("handles empty sections on either side", () => {
    expect(grouped(empty, base).map((c) => c.type)).toEqual([
      "added",
      "added",
      "added",
      "added",
    ]);
    expect(grouped(base, empty).map((c) => c.type)).toEqual([
      "removed",
      "removed",
      "removed",
      "removed",
    ]);
  });
});

describe("summarizeChanges", () => {
  it("names up to three changes and counts the rest", () => {
    const before = withNotes([note(1)]);
    const after = withNotes([note(1), note(2), note(3), note(4), note(5)]);
    expect(summarizeChanges(diffCMSSections(before, after))).toBe(
      'Added Notes "Chapter 2"; Added Notes "Chapter 3"; Added Notes "Chapter 4" (+1 more)',
    );
  });

  it("says when nothing changed", () => {
    expect(summarizeChanges(diffCMSSections(empty, empty))).toBe("No content changes");
  });
});
