/** Parse comma-separated blog tags into trimmed, non-empty labels. */
export function parseBlogTags(tag?: string): string[] {
  if (!tag?.trim()) return [];
  return tag
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
