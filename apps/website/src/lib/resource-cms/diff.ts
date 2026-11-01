import type {
  EditableSection,
  ResourceCmsChange,
  ResourceCmsGroupedChange,
  ResourceCMSSections,
} from "@/types/resources2";
import { createHash } from "crypto";

export const CMS_SECTIONS: EditableSection[] = [
  "syllabus",
  "notes",
  "worksheets",
  "tools",
  "books",
  "youtubeChannel",
  "youtubePlaylist",
];

const IGNORED_ITEM_FIELDS = new Set(["_id", "__v"]);

const SECTION_FIELDS: Record<EditableSection, readonly string[]> = {
  syllabus: ["title", "board", "link"],
  notes: ["title", "source", "link", "tags"],
  worksheets: ["title", "link", "board", "topic", "difficulty", "yearRange"],
  tools: ["name", "url", "description"],
  books: ["title", "edition", "cover", "buy"],
  youtubeChannel: ["channel", "channelUrl", "description", "thumbnail", "type"],
  youtubePlaylist: ["title", "playlistUrl", "description", "thumbnail", "type"],
};

const SECTION_LABELS: Record<EditableSection, string> = {
  syllabus: "Syllabus",
  notes: "Notes",
  worksheets: "Worksheets",
  tools: "Tools",
  books: "Books",
  youtubeChannel: "YouTube Channels",
  youtubePlaylist: "Playlists & Videos",
};

const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  board: "Board",
  link: "Link",
  source: "Source",
  tags: "Tags",
  topic: "Topic",
  difficulty: "Difficulty",
  yearRange: "Year range",
  name: "Name",
  url: "URL",
  description: "Description",
  edition: "Edition",
  cover: "Cover",
  buy: "Buy link",
  channel: "Channel",
  channelUrl: "Channel URL",
  thumbnail: "Thumbnail",
  type: "Type",
  playlistUrl: "Playlist URL",
};

function normalizeValue(value: unknown): unknown {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === "string" ? entry.trim() : entry))
      .filter((entry) => entry !== "");
  }
  if (typeof value === "string") return value.trim();
  return value;
}

function normalizeItem(
  section: EditableSection,
  item: Record<string, unknown>,
): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};
  for (const field of SECTION_FIELDS[section]) {
    normalized[field] = normalizeValue(item[field]);
  }
  return normalized;
}

export function normalizeCMSSections(
  sections: ResourceCMSSections,
): ResourceCMSSections {
  return {
    syllabus: sections.syllabus.map((item) =>
      normalizeItem("syllabus", item as Record<string, unknown>),
    ) as ResourceCMSSections["syllabus"],
    notes: sections.notes.map((item) =>
      normalizeItem("notes", item as Record<string, unknown>),
    ) as ResourceCMSSections["notes"],
    worksheets: sections.worksheets.map((item) =>
      normalizeItem("worksheets", item as Record<string, unknown>),
    ) as ResourceCMSSections["worksheets"],
    tools: sections.tools.map((item) =>
      normalizeItem("tools", item as Record<string, unknown>),
    ) as ResourceCMSSections["tools"],
    books: sections.books.map((item) =>
      normalizeItem("books", item as Record<string, unknown>),
    ) as ResourceCMSSections["books"],
    youtubeChannel: sections.youtubeChannel.map((item) =>
      normalizeItem("youtubeChannel", item as Record<string, unknown>),
    ) as ResourceCMSSections["youtubeChannel"],
    youtubePlaylist: sections.youtubePlaylist.map((item) =>
      normalizeItem("youtubePlaylist", item as Record<string, unknown>),
    ) as ResourceCMSSections["youtubePlaylist"],
  };
}

export function extractCMSSections(source: {
  syllabus?: unknown[];
  notes?: unknown[];
  worksheets?: unknown[];
  tools?: unknown[];
  books?: unknown[];
  youtubeChannel?: unknown[];
  youtubePlaylist?: unknown[];
}): ResourceCMSSections {
  const raw = {
    syllabus: (Array.isArray(source.syllabus)
      ? source.syllabus
      : []) as ResourceCMSSections["syllabus"],
    notes: (Array.isArray(source.notes)
      ? source.notes
      : []) as ResourceCMSSections["notes"],
    worksheets: (Array.isArray(source.worksheets)
      ? source.worksheets
      : []) as ResourceCMSSections["worksheets"],
    tools: (Array.isArray(source.tools)
      ? source.tools
      : []) as ResourceCMSSections["tools"],
    books: (Array.isArray(source.books)
      ? source.books
      : []) as ResourceCMSSections["books"],
    youtubeChannel: (Array.isArray(source.youtubeChannel)
      ? source.youtubeChannel
      : []) as ResourceCMSSections["youtubeChannel"],
    youtubePlaylist: (Array.isArray(source.youtubePlaylist)
      ? source.youtubePlaylist
      : []) as ResourceCMSSections["youtubePlaylist"],
  };

  return normalizeCMSSections(raw);
}

function canonicalizeSections(sections: ResourceCMSSections): string {
  const ordered: Record<string, unknown> = {};
  for (const section of CMS_SECTIONS) {
    ordered[section] = sections[section];
  }
  return JSON.stringify(ordered);
}

export function contentHash(sections: ResourceCMSSections): string {
  const normalized = normalizeCMSSections(sections);
  return createHash("sha256")
    .update(canonicalizeSections(normalized))
    .digest("hex");
}

function getItemLabel(item: Record<string, unknown>, index: number): string {
  const label =
    item.title ?? item.name ?? item.topic ?? item.channel ?? item.channelUrl;
  if (typeof label === "string" && label.trim()) {
    return label.trim();
  }
  return `Item ${index + 1}`;
}

function stringifyValue(value: unknown): string {
  const normalized = normalizeValue(value);
  if (normalized === "") return "";
  if (Array.isArray(normalized)) return normalized.join(", ");
  return String(normalized);
}

/**
 * Fields that identify an item. Two changed items in the same spot that share
 * one of these are shown as one edited item rather than a remove and an add.
 */
const IDENTITY_FIELDS: Record<EditableSection, readonly string[]> = {
  syllabus: ["title", "link"],
  notes: ["title", "link"],
  worksheets: ["title", "link"],
  tools: ["name", "url"],
  books: ["title", "buy"],
  youtubeChannel: ["channel", "channelUrl"],
  youtubePlaylist: ["title", "playlistUrl"],
};

function itemKey(section: EditableSection, item: Record<string, unknown>) {
  return JSON.stringify(
    SECTION_FIELDS[section].map((field) => stringifyValue(item[field])),
  );
}

/** Index pairs [before, after] of the longest run of identical items, in order. */
function longestCommonItems(
  beforeKeys: string[],
  afterKeys: string[],
): [number, number][] {
  const n = beforeKeys.length;
  const m = afterKeys.length;
  // lengths[i][j] = LCS length of beforeKeys[i..] and afterKeys[j..]
  const lengths: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0),
  );
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lengths[i][j] =
        beforeKeys[i] === afterKeys[j]
          ? lengths[i + 1][j + 1] + 1
          : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
    }
  }

  const pairs: [number, number][] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (beforeKeys[i] === afterKeys[j]) {
      pairs.push([i, j]);
      i++;
      j++;
    } else if (lengths[i + 1][j] >= lengths[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }
  return pairs;
}

function sharedIdentity(
  section: EditableSection,
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): boolean {
  return IDENTITY_FIELDS[section].some((field) => {
    const value = stringifyValue(a[field]);
    return value !== "" && value === stringifyValue(b[field]);
  });
}

function equalFieldCount(
  section: EditableSection,
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): number {
  return SECTION_FIELDS[section].filter(
    (field) => stringifyValue(a[field]) === stringifyValue(b[field]),
  ).length;
}

/**
 * Within one gap between unchanged items, pair each removed item with the most
 * similar added item that shares a title or link. Returns after → before.
 */
function pairEditedItems(
  section: EditableSection,
  beforeItems: Record<string, unknown>[],
  afterItems: Record<string, unknown>[],
  beforeIdx: number[],
  afterIdx: number[],
): Map<number, number> {
  const candidates: { b: number; a: number; score: number }[] = [];
  for (const b of beforeIdx) {
    for (const a of afterIdx) {
      if (!sharedIdentity(section, beforeItems[b], afterItems[a])) continue;
      candidates.push({
        b,
        a,
        score: equalFieldCount(section, beforeItems[b], afterItems[a]),
      });
    }
  }
  // Best matches first; ties keep document order.
  candidates.sort((x, y) => y.score - x.score || x.a - y.a || x.b - y.b);

  const pairs = new Map<number, number>();
  const usedBefore = new Set<number>();
  for (const { b, a } of candidates) {
    if (pairs.has(a) || usedBefore.has(b)) continue;
    pairs.set(a, b);
    usedBefore.add(b);
  }
  return pairs;
}

function fieldChanges(
  section: EditableSection,
  index: number,
  beforeItem: Record<string, unknown>,
  afterItem: Record<string, unknown>,
): ResourceCmsChange[] {
  const label =
    getItemLabel(afterItem, index) || getItemLabel(beforeItem, index);
  const changes: ResourceCmsChange[] = [];
  for (const field of SECTION_FIELDS[section]) {
    if (IGNORED_ITEM_FIELDS.has(field)) continue;
    const before = stringifyValue(beforeItem[field]);
    const after = stringifyValue(afterItem[field]);
    if (before !== after) {
      changes.push({
        type: "field_changed",
        section,
        index,
        field,
        label,
        before,
        after,
      });
    }
  }
  return changes;
}

/**
 * Item-level diff for one section. Unchanged items are matched by content, so
 * adding or removing one item doesn't make every later item look edited.
 * Indexes are positions in `after` (or in `before` for removed items).
 */
function diffSectionItems(
  section: EditableSection,
  beforeItems: Record<string, unknown>[],
  afterItems: Record<string, unknown>[],
): ResourceCmsChange[] {
  const anchors = longestCommonItems(
    beforeItems.map((item) => itemKey(section, item)),
    afterItems.map((item) => itemKey(section, item)),
  );
  // Sentinel so the gap after the last unchanged item is handled too.
  anchors.push([beforeItems.length, afterItems.length]);

  const changes: ResourceCmsChange[] = [];
  let prevBefore = 0;
  let prevAfter = 0;

  for (const [anchorBefore, anchorAfter] of anchors) {
    const beforeIdx: number[] = [];
    const afterIdx: number[] = [];
    for (let i = prevBefore; i < anchorBefore; i++) beforeIdx.push(i);
    for (let j = prevAfter; j < anchorAfter; j++) afterIdx.push(j);

    if (beforeIdx.length > 0 || afterIdx.length > 0) {
      const edited = pairEditedItems(
        section,
        beforeItems,
        afterItems,
        beforeIdx,
        afterIdx,
      );
      const pairedBefore = new Set(edited.values());

      for (const b of beforeIdx) {
        if (pairedBefore.has(b)) continue;
        changes.push({
          type: "item_removed",
          section,
          index: b,
          label: getItemLabel(beforeItems[b], b),
        });
      }

      for (const a of afterIdx) {
        const b = edited.get(a);
        if (b === undefined) {
          changes.push({
            type: "item_added",
            section,
            index: a,
            label: getItemLabel(afterItems[a], a),
          });
        } else {
          changes.push(...fieldChanges(section, a, beforeItems[b], afterItems[a]));
        }
      }
    }

    prevBefore = anchorBefore + 1;
    prevAfter = anchorAfter + 1;
  }

  return changes;
}

export function diffCMSSections(
  before: ResourceCMSSections,
  after: ResourceCMSSections,
): ResourceCmsChange[] {
  const normalizedBefore = normalizeCMSSections(before);
  const normalizedAfter = normalizeCMSSections(after);
  const changes: ResourceCmsChange[] = [];

  for (const section of CMS_SECTIONS) {
    const sectionChanges = diffSectionItems(
      section,
      normalizedBefore[section] as Record<string, unknown>[],
      normalizedAfter[section] as Record<string, unknown>[],
    );

    if (sectionChanges.length === 0) {
      changes.push({ type: "section_unchanged", section });
    } else {
      changes.push(...sectionChanges);
    }
  }

  return changes;
}

export function groupResourceCmsChanges(
  changes: ResourceCmsChange[],
): ResourceCmsGroupedChange[] {
  const meaningful = changes.filter((c) => c.type !== "section_unchanged");
  const grouped: ResourceCmsGroupedChange[] = [];
  const modifiedMap = new Map<string, ResourceCmsGroupedChange>();

  for (const change of meaningful) {
    if (change.type === "item_added") {
      grouped.push({
        type: "added",
        section: change.section,
        sectionLabel: SECTION_LABELS[change.section],
        label: change.label,
      });
      continue;
    }

    if (change.type === "item_removed") {
      grouped.push({
        type: "removed",
        section: change.section,
        sectionLabel: SECTION_LABELS[change.section],
        label: change.label,
      });
      continue;
    }

    if (change.type === "field_changed") {
      const key = `${change.section}:${change.index}:${change.label}`;
      const existing = modifiedMap.get(key);
      const fieldChange = {
        field: change.field,
        fieldLabel: FIELD_LABELS[change.field] ?? change.field,
        before: change.before,
        after: change.after,
      };

      if (existing?.type === "modified") {
        existing.fields.push(fieldChange);
      } else {
        const entry: ResourceCmsGroupedChange = {
          type: "modified",
          section: change.section,
          sectionLabel: SECTION_LABELS[change.section],
          label: change.label,
          fields: [fieldChange],
        };
        modifiedMap.set(key, entry);
        grouped.push(entry);
      }
    }
  }

  return grouped;
}

export function summarizeChanges(changes: ResourceCmsChange[]): string {
  const grouped = groupResourceCmsChanges(changes);
  if (grouped.length === 0) return "No content changes";

  const parts = grouped.slice(0, 3).map((change) => {
    switch (change.type) {
      case "added":
        return `Added ${change.sectionLabel} "${change.label}"`;
      case "removed":
        return `Removed ${change.sectionLabel} "${change.label}"`;
      case "modified":
        return `Updated ${change.sectionLabel} "${change.label}"`;
      default:
        return "";
    }
  });

  const suffix = grouped.length > 3 ? ` (+${grouped.length - 3} more)` : "";
  return parts.filter(Boolean).join("; ") + suffix;
}

export function getSectionLabel(section: EditableSection): string {
  return SECTION_LABELS[section];
}

export function getFieldLabel(field: string): string {
  return FIELD_LABELS[field] ?? field;
}
