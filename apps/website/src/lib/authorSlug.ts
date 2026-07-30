import { slugify } from "@/lib/slugify";

/** Stable public URL slug: `jane-doe-507f1f77bcf86cd799439011` */
export function buildAuthorSlug(name: string, userId: string): string {
  const base = slugify(name.trim() || "author");
  return `${base || "author"}-${userId}`;
}

/** Extract MongoDB user id from an author slug (24-char hex suffix). */
export function parseAuthorUserIdFromSlug(slug: string): string | null {
  const match = slug.match(/([a-f0-9]{24})$/i);
  return match ? match[1] : null;
}
