import {
  formatLegalDate,
  LEGAL_PAGE_CATALOG,
  legalDateTimeAttr,
  legalPublicPath,
  type LegalPageSlug,
} from "@/lib/legal-pages";
import { ensureLegalPages } from "@/lib/legal-pages/ensure";
import connectDB from "@/lib/mongodb";
import LegalPage from "@/models/legalPage";

export type AdminLegalPageListItem = {
  slug: LegalPageSlug;
  title: string;
  path: string;
  lastPublishedAt: string | null;
  lastPublishedLabel: string | null;
  hasDraft: boolean;
};

export type AdminLegalPageEditor = {
  slug: LegalPageSlug;
  title: string;
  content: unknown[];
  publishedTitle: string;
  lastPublishedAt: string | null;
  lastPublishedLabel: string | null;
  lastPublishedDateTime: string | null;
  path: string;
  hasDraft: boolean;
  draftUpdatedAt: string | null;
};

type LegalDraft = {
  title?: string;
  content?: unknown[];
  updatedAt?: Date;
};

type LegalPageDoc = {
  slug: string;
  title?: string;
  content?: unknown[];
  lastPublishedAt?: Date;
  draft?: LegalDraft | null;
};

function hasDraftLayer(draft: LegalDraft | null | undefined): boolean {
  return Boolean(draft?.updatedAt);
}

function formatMaybeDate(value?: Date | null): {
  iso: string | null;
  label: string | null;
  dateTime: string | null;
} {
  if (!value) {
    return { iso: null, label: null, dateTime: null };
  }
  const date = new Date(value);
  return {
    iso: date.toISOString(),
    label: formatLegalDate(date),
    dateTime: legalDateTimeAttr(date),
  };
}

export function serializeLegalListItem(doc: LegalPageDoc): AdminLegalPageListItem | null {
  const meta = LEGAL_PAGE_CATALOG.find((page) => page.slug === doc.slug);
  if (!meta) return null;

  const published = formatMaybeDate(doc.lastPublishedAt);
  return {
    slug: meta.slug,
    title: doc.title ?? meta.title,
    path: legalPublicPath(meta.slug),
    lastPublishedAt: published.iso,
    lastPublishedLabel: published.label,
    hasDraft: hasDraftLayer(doc.draft),
  };
}

export function serializeLegalEditor(doc: LegalPageDoc): AdminLegalPageEditor | null {
  const meta = LEGAL_PAGE_CATALOG.find((page) => page.slug === doc.slug);
  if (!meta) return null;

  const published = formatMaybeDate(doc.lastPublishedAt);
  const draft = doc.draft;
  const usingDraft = hasDraftLayer(draft);

  return {
    slug: meta.slug,
    title: usingDraft ? (draft?.title ?? doc.title ?? meta.title) : (doc.title ?? meta.title),
    content: usingDraft
      ? (Array.isArray(draft?.content) ? draft.content : [])
      : (Array.isArray(doc.content) ? doc.content : []),
    publishedTitle: doc.title ?? meta.title,
    lastPublishedAt: published.iso,
    lastPublishedLabel: published.label,
    lastPublishedDateTime: published.dateTime,
    path: legalPublicPath(meta.slug),
    hasDraft: usingDraft,
    draftUpdatedAt: draft?.updatedAt ? new Date(draft.updatedAt).toISOString() : null,
  };
}

export async function getAdminLegalPages(): Promise<AdminLegalPageListItem[]> {
  await connectDB();
  await ensureLegalPages();

  const docs = await LegalPage.find()
    .select("slug title lastPublishedAt draft.updatedAt")
    .lean<LegalPageDoc[]>();

  const bySlug = new Map(docs.map((doc) => [doc.slug, doc]));

  return LEGAL_PAGE_CATALOG.map((page) => {
    const doc = bySlug.get(page.slug);
    if (!doc) {
      return {
        slug: page.slug,
        title: page.title,
        path: legalPublicPath(page.slug),
        lastPublishedAt: null,
        lastPublishedLabel: null,
        hasDraft: false,
      };
    }
    return serializeLegalListItem(doc)!;
  });
}

export async function getAdminLegalPage(
  slug: string,
): Promise<AdminLegalPageEditor | null> {
  await connectDB();
  await ensureLegalPages();

  const doc = await LegalPage.findOne({ slug }).lean<LegalPageDoc | null>();
  if (!doc) return null;
  return serializeLegalEditor(doc);
}
