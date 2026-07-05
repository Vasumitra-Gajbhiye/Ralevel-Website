export const BOARD_SLUGS = [
  "cambridge",
  "edexcel-uk",
  "edexcel-ial",
  "aqa",
  "ocr",
  "wjec",
] as const;

export type BoardSlug = (typeof BOARD_SLUGS)[number];

export const BOARDS = [
  {
    name: "Cambridge",
    slug: "cambridge",
    levels: ["AS Level", "A2 Level"],
  },
  {
    name: "Edexcel IAL",
    slug: "edexcel-ial",
    levels: ["Year 1", "Year 2"],
  },
  {
    name: "Edexcel UK",
    slug: "edexcel-uk",
    levels: ["Year 1", "Year 2"],
  },
  {
    name: "AQA",
    slug: "aqa",
    levels: ["A Level"],
  },
  {
    name: "OCR",
    slug: "ocr",
    levels: ["A Level"],
  },
  {
    name: "WJEC",
    slug: "wjec",
    levels: ["A Level"],
  },
] as const;

export function isValidBoardSlug(slug: string): slug is BoardSlug {
  return (BOARD_SLUGS as readonly string[]).includes(slug);
}

export function getBoardBySlug(slug: string) {
  return BOARDS.find((b) => b.slug === slug);
}

export function levelToSlug(level: string) {
  return level.toLowerCase().replace(/\s+/g, "-");
}

export function slugToLevel(slug: string) {
  for (const board of BOARDS) {
    for (const level of board.levels) {
      if (levelToSlug(level) === slug) return level;
    }
  }
  return undefined;
}
