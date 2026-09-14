import { cachedQuery } from "@/lib/data-cache";
import {
  formatLegalDate,
  isLegalPageSlug,
  legalDateTimeAttr,
  legalPublicPath,
} from "@/lib/legal-pages";
import { ensureLegalPages } from "@/lib/legal-pages/ensure";
import connectDB from "@/lib/mongodb";
import LegalPage from "@/models/legalPage";

export type PublicLegalPage = {
  slug: string;
  title: string;
  content: unknown[];
  lastPublishedAt: string;
  lastPublishedLabel: string;
  lastPublishedDateTime: string;
  path: string;
};

type LegalPageDoc = {
  slug: string;
  title?: string;
  content?: unknown[];
  lastPublishedAt?: Date;
};

async function fetchLegalPageBySlug(
  slug: string,
): Promise<PublicLegalPage | null> {
  await connectDB();

  const doc = await LegalPage.findOne({ slug }).lean<LegalPageDoc | null>();
  if (!doc) return null;

  const lastPublishedAt = doc.lastPublishedAt
    ? new Date(doc.lastPublishedAt)
    : new Date();
  const content = Array.isArray(doc.content) ? doc.content : [];
  if (content.length === 0) return null;

  return {
    slug: doc.slug,
    title: doc.title ?? slug,
    content,
    lastPublishedAt: lastPublishedAt.toISOString(),
    lastPublishedLabel: formatLegalDate(lastPublishedAt),
    lastPublishedDateTime: legalDateTimeAttr(lastPublishedAt),
    path: legalPublicPath(doc.slug),
  };
}

export async function getLegalPageBySlug(
  slug: string,
): Promise<PublicLegalPage | null> {
  if (!isLegalPageSlug(slug)) return null;

  await ensureLegalPages();

  return cachedQuery(
    ["legal", "page", slug],
    () => fetchLegalPageBySlug(slug),
    { revalidate: 3600, tags: ["legal"] },
  );
}
