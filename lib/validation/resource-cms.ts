import type {
  NotesItem,
  ResourceCMSDraftPayload,
  SyllabusItem,
  ToolsItem,
  WorksheetItem,
} from "@/types/resources2";

const RESOURCE_BOARDS = ["CAIE", "Edexcel", "AQA", "WJEC/Eduqas"] as const;
const MAX_NOTES_TAGS = 4;
const MAX_TOOL_DESCRIPTION_LENGTH = 200;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateSyllabusItem(item: unknown, index: number): SyllabusItem {
  if (!item || typeof item !== "object") {
    throw new Error(`Syllabus item ${index + 1} is invalid`);
  }

  const record = item as Record<string, unknown>;
  if (!isNonEmptyString(record.title)) {
    throw new Error(`Syllabus item ${index + 1}: title is required`);
  }
  if (!isNonEmptyString(record.board)) {
    throw new Error(`Syllabus item ${index + 1}: board is required`);
  }
  const board = record.board.trim();
  if (!RESOURCE_BOARDS.includes(board as (typeof RESOURCE_BOARDS)[number])) {
    throw new Error(`Syllabus item ${index + 1}: board is invalid`);
  }
  if (!isNonEmptyString(record.link) || !isValidUrl(record.link.trim())) {
    throw new Error(`Syllabus item ${index + 1}: link must be a valid URL`);
  }

  return {
    title: record.title.trim(),
    board,
    link: record.link.trim(),
  };
}

function validateNotesItem(item: unknown, index: number): NotesItem {
  if (!item || typeof item !== "object") {
    throw new Error(`Notes item ${index + 1} is invalid`);
  }

  const record = item as Record<string, unknown>;
  if (!isNonEmptyString(record.title)) {
    throw new Error(`Notes item ${index + 1}: title is required`);
  }
  if (!isNonEmptyString(record.link) || !isValidUrl(record.link.trim())) {
    throw new Error(`Notes item ${index + 1}: link must be a valid URL`);
  }

  const tags = Array.isArray(record.tags)
    ? record.tags
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : typeof record.tags === "string"
      ? record.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : undefined;

  if (tags && tags.length > MAX_NOTES_TAGS) {
    throw new Error(`Notes item ${index + 1}: maximum ${MAX_NOTES_TAGS} tags allowed`);
  }

  return {
    title: record.title.trim(),
    source: isNonEmptyString(record.source) ? record.source.trim() : undefined,
    link: record.link.trim(),
    tags,
  };
}

function validateWorksheetItem(item: unknown, index: number): WorksheetItem {
  if (!item || typeof item !== "object") {
    throw new Error(`Worksheet item ${index + 1} is invalid`);
  }

  const record = item as Record<string, unknown>;
  if (!isNonEmptyString(record.title)) {
    throw new Error(`Worksheet item ${index + 1}: title is required`);
  }
  if (!isNonEmptyString(record.link) || !isValidUrl(record.link.trim())) {
    throw new Error(`Worksheet item ${index + 1}: link must be a valid URL`);
  }

  const board = isNonEmptyString(record.board) ? record.board.trim() : undefined;
  if (
    board &&
    !RESOURCE_BOARDS.includes(board as (typeof RESOURCE_BOARDS)[number])
  ) {
    throw new Error(`Worksheet item ${index + 1}: board is invalid`);
  }

  return {
    title: record.title.trim(),
    link: record.link.trim(),
    board,
    topic: isNonEmptyString(record.topic) ? record.topic.trim() : undefined,
    difficulty: isNonEmptyString(record.difficulty)
      ? record.difficulty.trim()
      : undefined,
    yearRange: isNonEmptyString(record.yearRange)
      ? record.yearRange.trim()
      : undefined,
  };
}

function validateToolsItem(item: unknown, index: number): ToolsItem {
  if (!item || typeof item !== "object") {
    throw new Error(`Tools item ${index + 1} is invalid`);
  }

  const record = item as Record<string, unknown>;
  if (!isNonEmptyString(record.name)) {
    throw new Error(`Tools item ${index + 1}: name is required`);
  }
  if (!isNonEmptyString(record.url) || !isValidUrl(record.url.trim())) {
    throw new Error(`Tools item ${index + 1}: url must be a valid URL`);
  }

  const description = isNonEmptyString(record.description)
    ? record.description.trim()
    : undefined;
  if (
    description &&
    description.length > MAX_TOOL_DESCRIPTION_LENGTH
  ) {
    throw new Error(
      `Tools item ${index + 1}: description must be ${MAX_TOOL_DESCRIPTION_LENGTH} characters or fewer`
    );
  }

  return {
    name: record.name.trim(),
    url: record.url.trim(),
    description,
  };
}

function validateArray<T>(
  value: unknown,
  label: string,
  validator: (item: unknown, index: number) => T
): T[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array`);
  }
  return value.map((item, index) => validator(item, index));
}

export function validateResourceCMSDraftPayload(
  body: unknown
): ResourceCMSDraftPayload {
  if (!body || typeof body !== "object") {
    throw new Error("Request body is invalid");
  }

  const record = body as Record<string, unknown>;
  const payload: ResourceCMSDraftPayload = {};

  if (record.syllabus !== undefined) {
    payload.syllabus = validateArray(
      record.syllabus,
      "syllabus",
      validateSyllabusItem
    );
  }
  if (record.notes !== undefined) {
    payload.notes = validateArray(record.notes, "notes", validateNotesItem);
  }
  if (record.worksheets !== undefined) {
    payload.worksheets = validateArray(
      record.worksheets,
      "worksheets",
      validateWorksheetItem
    );
  }
  if (record.tools !== undefined) {
    payload.tools = validateArray(record.tools, "tools", validateToolsItem);
  }

  if (
    payload.syllabus === undefined &&
    payload.notes === undefined &&
    payload.worksheets === undefined &&
    payload.tools === undefined
  ) {
    throw new Error("At least one editable section must be provided");
  }

  return payload;
}

export function validateFullResourceCMSDraft(
  body: unknown
): Required<ResourceCMSDraftPayload> {
  if (!body || typeof body !== "object") {
    throw new Error("Request body is invalid");
  }

  const record = body as Record<string, unknown>;

  return {
    syllabus: validateArray(record.syllabus, "syllabus", validateSyllabusItem),
    notes: validateArray(record.notes, "notes", validateNotesItem),
    worksheets: validateArray(
      record.worksheets,
      "worksheets",
      validateWorksheetItem
    ),
    tools: validateArray(record.tools, "tools", validateToolsItem),
  };
}
