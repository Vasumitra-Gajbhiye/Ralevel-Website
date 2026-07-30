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

function itemsEqual(
  section: EditableSection,
  beforeItem: Record<string, unknown>,
  afterItem: Record<string, unknown>,
): boolean {
  return SECTION_FIELDS[section].every(
    (field) =>
      stringifyValue(beforeItem[field]) === stringifyValue(afterItem[field]),
  );
}

function diffSectionItems(
  section: EditableSection,
  beforeItems: Record<string, unknown>[],
  afterItems: Record<string, unknown>[],
): ResourceCmsChange[] {
  const changes: ResourceCmsChange[] = [];
  const maxLen = Math.max(beforeItems.length, afterItems.length);

  for (let index = 0; index < maxLen; index++) {
    const beforeItem = beforeItems[index];
    const afterItem = afterItems[index];

    if (beforeItem === undefined && afterItem !== undefined) {
      changes.push({
        type: "item_added",
        section,
        index,
        label: getItemLabel(afterItem, index),
      });
      continue;
    }

    if (afterItem === undefined && beforeItem !== undefined) {
      changes.push({
        type: "item_removed",
        section,
        index,
        label: getItemLabel(beforeItem, index),
      });
      continue;
    }

    if (!beforeItem || !afterItem) continue;

    if (itemsEqual(section, beforeItem, afterItem)) continue;

    const label =
      getItemLabel(afterItem, index) || getItemLabel(beforeItem, index);

    for (const field of SECTION_FIELDS[section]) {
      if (IGNORED_ITEM_FIELDS.has(field)) continue;

      const beforeValue = stringifyValue(beforeItem[field]);
      const afterValue = stringifyValue(afterItem[field]);
      if (beforeValue !== afterValue) {
        changes.push({
          type: "field_changed",
          section,
          index,
          field,
          label,
          before: beforeValue,
          after: afterValue,
        });
      }
    }
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
