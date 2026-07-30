import { getBoardBySlug, slugToLevel } from "@/lib/boards";

function titleCaseWords(value: string): string {
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function formatBoardLabel(slug: string): string {
  return getBoardBySlug(slug)?.name ?? titleCaseWords(slug);
}

export function formatLevelLabel(slug: string): string {
  return slugToLevel(slug) ?? titleCaseWords(slug);
}

export function formatSubjectLabel(slug: string): string {
  return titleCaseWords(slug);
}

export function formatChapterLabel(slug: string): string {
  return titleCaseWords(slug);
}
