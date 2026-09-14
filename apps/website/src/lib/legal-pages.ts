export const LEGAL_ADMIN_ROLES = ["owner", "admin"] as const;

export const LEGAL_PAGE_CATALOG = [
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    originalPublishedAt: utcDate(2025, 10, 31),
  },
  {
    slug: "terms-of-service",
    title: "Terms of Service",
    originalPublishedAt: utcDate(2025, 10, 31),
  },
  {
    slug: "discord-regulations",
    title: "Discord Regulations",
    originalPublishedAt: utcDate(2025, 12, 1),
  },
  {
    slug: "application-bot/privacy-policy",
    title: "Application Bot Privacy Policy",
    originalPublishedAt: utcDate(2026, 7, 30),
  },
  {
    slug: "application-bot/terms-of-service",
    title: "Application Bot Terms of Service",
    originalPublishedAt: utcDate(2026, 7, 30),
  },
  {
    slug: "ralevel-bot/privacy-policy",
    title: "r/alevel Bot Privacy Policy",
    originalPublishedAt: utcDate(2026, 7, 30),
  },
  {
    slug: "ralevel-bot/terms-of-service",
    title: "r/alevel Bot Terms of Service",
    originalPublishedAt: utcDate(2026, 7, 30),
  },
] as const;

export type LegalPageSlug = (typeof LEGAL_PAGE_CATALOG)[number]["slug"];

const SLUG_SET = new Set<string>(LEGAL_PAGE_CATALOG.map((page) => page.slug));

function utcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

export function isLegalPageSlug(slug: string): slug is LegalPageSlug {
  return SLUG_SET.has(slug);
}

export function joinLegalSlug(segments: string[]): string {
  return segments.filter(Boolean).join("/");
}

export function legalPublicPath(slug: string): string {
  return `/legal/${slug}`;
}

export function getLegalPageMeta(slug: string) {
  return LEGAL_PAGE_CATALOG.find((page) => page.slug === slug) ?? null;
}

export function formatLegalDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function legalDateTimeAttr(date: Date): string {
  return date.toISOString().slice(0, 10);
}
