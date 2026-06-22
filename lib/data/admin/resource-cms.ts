import connectDB from "@/lib/mongodb";
import { buildPaginatedResponse, type PaginatedResult } from "@/lib/pagination";
import { extractCMSSections } from "@/lib/resource-cms/diff";
import resources2Data from "@/models/resources2Data";
import type {
  AdminResourceSubject,
  ResourceCmsActor,
  ResourceCMSEditorData,
  ResourceDraft,
} from "@/types/resources2";

type GetAdminResourceSubjectsParams = {
  page: number;
  limit: number;
  skip: number;
};

function toIsoString(value: unknown): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function cloneSection<T>(items: T[] | undefined | null): T[] {
  return Array.isArray(items) ? JSON.parse(JSON.stringify(items)) : [];
}

export function buildDraftFromLive(doc: {
  syllabus?: unknown[];
  notes?: unknown[];
  worksheets?: unknown[];
  tools?: unknown[];
  books?: unknown[];
  youtubeChannel?: unknown[];
  youtubePlaylist?: unknown[];
}): ResourceDraft {
  return {
    syllabus: cloneSection(doc.syllabus as ResourceDraft["syllabus"]),
    notes: cloneSection(doc.notes as ResourceDraft["notes"]),
    worksheets: cloneSection(doc.worksheets as ResourceDraft["worksheets"]),
    tools: cloneSection(doc.tools as ResourceDraft["tools"]),
    books: cloneSection(doc.books as ResourceDraft["books"]),
    youtubeChannel: cloneSection(
      doc.youtubeChannel as ResourceDraft["youtubeChannel"]
    ),
    youtubePlaylist: cloneSection(
      doc.youtubePlaylist as ResourceDraft["youtubePlaylist"]
    ),
  };
}

export function isDraftEmpty(draft: ResourceDraft | null | undefined): boolean {
  if (!draft) return true;
  return (
    (draft.syllabus?.length ?? 0) === 0 &&
    (draft.notes?.length ?? 0) === 0 &&
    (draft.worksheets?.length ?? 0) === 0 &&
    (draft.tools?.length ?? 0) === 0 &&
    (draft.books?.length ?? 0) === 0 &&
    (draft.youtubeChannel?.length ?? 0) === 0 &&
    (draft.youtubePlaylist?.length ?? 0) === 0
  );
}

export function resolveCMSDraft(
  doc: {
    syllabus?: unknown[];
    notes?: unknown[];
    worksheets?: unknown[];
    tools?: unknown[];
    books?: unknown[];
    youtubeChannel?: unknown[];
    youtubePlaylist?: unknown[];
    draft?: ResourceDraft | null;
  }
): ResourceDraft {
  const rawDraft = doc.draft;
  let draft = serializeDraft(rawDraft ?? undefined);

  if (isDraftEmpty(draft)) {
    return buildDraftFromLive(doc);
  }

  if (!rawDraft) {
    return draft;
  }

  const liveDraft = buildDraftFromLive(doc);
  const nextDraft = { ...draft };

  if (!Array.isArray(rawDraft.books) && liveDraft.books.length > 0) {
    nextDraft.books = liveDraft.books;
  }
  if (
    !Array.isArray(rawDraft.youtubeChannel) &&
    liveDraft.youtubeChannel.length > 0
  ) {
    nextDraft.youtubeChannel = liveDraft.youtubeChannel;
  }
  if (
    !Array.isArray(rawDraft.youtubePlaylist) &&
    liveDraft.youtubePlaylist.length > 0
  ) {
    nextDraft.youtubePlaylist = liveDraft.youtubePlaylist;
  }

  return nextDraft;
}

export function serializeDraft(
  draft: ResourceDraft | null | undefined
): ResourceDraft {
  if (!draft) {
    return {
      syllabus: [],
      notes: [],
      worksheets: [],
      tools: [],
      books: [],
      youtubeChannel: [],
      youtubePlaylist: [],
    };
  }

  return {
    syllabus: cloneSection(draft.syllabus),
    notes: cloneSection(draft.notes),
    worksheets: cloneSection(draft.worksheets),
    tools: cloneSection(draft.tools),
    books: cloneSection(draft.books),
    youtubeChannel: cloneSection(draft.youtubeChannel),
    youtubePlaylist: cloneSection(draft.youtubePlaylist),
    updatedAt: toIsoString(draft.updatedAt),
    updatedBy: draft.updatedBy
      ? {
          userId: draft.updatedBy.userId,
          email: draft.updatedBy.email,
        }
      : undefined,
  };
}

export async function getAdminResourceSubjectsList({
  page,
  limit,
  skip,
}: GetAdminResourceSubjectsParams): Promise<
  PaginatedResult<AdminResourceSubject>
> {
  await connectDB();

  const [data, total] = await Promise.all([
    resources2Data
      .find(
        {},
        {
          subject: 1,
          slug: 1,
          hasUnpublishedChanges: 1,
          publishedAt: 1,
          updatedAt: 1,
          "draft.updatedAt": 1,
        }
      )
      .sort({ subject: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    resources2Data.countDocuments(),
  ]);

  const subjects: AdminResourceSubject[] = data.map((doc) => ({
    _id: String(doc._id),
    subject: doc.subject,
    slug: doc.slug,
    hasUnpublishedChanges: Boolean(doc.hasUnpublishedChanges),
    publishedAt: toIsoString(doc.publishedAt),
    draftUpdatedAt: toIsoString(
      (doc as { draft?: { updatedAt?: unknown } }).draft?.updatedAt
    ),
    updatedAt: toIsoString(doc.updatedAt) ?? new Date().toISOString(),
  }));

  return buildPaginatedResponse(subjects, total, page, limit);
}

export async function getAdminResourceEditorData(
  slug: string
): Promise<ResourceCMSEditorData | null> {
  await connectDB();

  const doc = (await resources2Data.findOne({ slug }).lean()) as {
    _id: unknown;
    subject: string;
    slug: string;
    level?: string;
    syllabus?: unknown[];
    notes?: unknown[];
    worksheets?: unknown[];
    tools?: unknown[];
    books?: unknown[];
    youtubeChannel?: unknown[];
    youtubePlaylist?: unknown[];
    draft?: ResourceDraft;
    hasUnpublishedChanges?: boolean;
    publishedAt?: Date;
    updatedAt?: Date;
  } | null;

  if (!doc) return null;

  let draft = resolveCMSDraft(doc);
  const rawDraft = doc.draft as ResourceDraft | undefined;

  if (isDraftEmpty(serializeDraft(rawDraft ?? undefined))) {
    await resources2Data.updateOne(
      { slug },
      {
        $set: {
          draft: {
            ...draft,
            updatedAt: doc.updatedAt ?? new Date(),
          },
          ...(doc.publishedAt ? {} : { publishedAt: doc.updatedAt ?? new Date() }),
        },
      }
    );
  } else if (
    rawDraft &&
    (!Array.isArray(rawDraft.books) ||
      !Array.isArray(rawDraft.youtubeChannel) ||
      !Array.isArray(rawDraft.youtubePlaylist))
  ) {
    await resources2Data.updateOne(
      { slug },
      {
        $set: {
          draft: {
            ...toDraftDocument(draft),
            updatedAt: rawDraft.updatedAt ?? doc.updatedAt ?? new Date(),
            updatedBy: rawDraft.updatedBy,
          },
        },
      }
    );
  }

  return {
    _id: String(doc._id),
    subject: doc.subject,
    slug: doc.slug,
    level: doc.level ?? "A-Level",
    hasUnpublishedChanges: Boolean(doc.hasUnpublishedChanges),
    publishedAt: toIsoString(doc.publishedAt),
    draft,
  };
}

type ResourceCMSDocSnapshot = {
  subject: string;
  slug: string;
  syllabus?: unknown[];
  notes?: unknown[];
  worksheets?: unknown[];
  tools?: unknown[];
  books?: unknown[];
  youtubeChannel?: unknown[];
  youtubePlaylist?: unknown[];
  draft?: ResourceDraft;
  publishedAt?: Date;
  updatedAt?: Date;
};

const CMS_DRAFT_PROJECTION = {
  subject: 1,
  slug: 1,
  syllabus: 1,
  notes: 1,
  worksheets: 1,
  tools: 1,
  books: 1,
  youtubeChannel: 1,
  youtubePlaylist: 1,
  draft: 1,
  publishedAt: 1,
  updatedAt: 1,
} as const;

export async function getResourceCMSDocSnapshot(
  slug: string
): Promise<ResourceCMSDocSnapshot | null> {
  await connectDB();
  return resources2Data
    .findOne({ slug }, CMS_DRAFT_PROJECTION)
    .lean<ResourceCMSDocSnapshot>();
}

function toDraftDocument(draft: ResourceDraft) {
  return {
    syllabus: draft.syllabus,
    notes: draft.notes,
    worksheets: draft.worksheets,
    tools: draft.tools,
    books: draft.books,
    youtubeChannel: draft.youtubeChannel,
    youtubePlaylist: draft.youtubePlaylist,
    updatedAt: new Date(),
    updatedBy: draft.updatedBy,
  };
}

export async function saveResourceCMSDraft(
  slug: string,
  draft: ResourceDraft,
  options?: {
    actor?: ResourceCmsActor;
    skipRevisionLog?: boolean;
  }
): Promise<{ slug: string; hasUnpublishedChanges: true; draft: ResourceDraft } | null> {
  await connectDB();

  const existing = await getResourceCMSDocSnapshot(slug);
  if (!existing) return null;

  const beforeSections = extractCMSSections(resolveCMSDraft(existing));

  const $set: Record<string, unknown> = {
    draft: toDraftDocument(draft),
    hasUnpublishedChanges: true,
  };

  if (!existing.publishedAt) {
    $set.publishedAt = existing.updatedAt ?? new Date();
  }

  await resources2Data.updateOne({ slug }, { $set });

  const afterSections = extractCMSSections(draft);

  if (!options?.skipRevisionLog && options?.actor) {
    const { recordDraftSaveRevision } = await import("./resource-cms-revisions");
    await recordDraftSaveRevision({
      slug,
      subject: existing.subject,
      actor: options.actor,
      before: beforeSections,
      after: afterSections,
    });
  }

  return {
    slug,
    hasUnpublishedChanges: true,
    draft: serializeDraft({
      ...draft,
      updatedAt: new Date().toISOString(),
    }),
  };
}

export async function publishResourceCMSDraft(
  slug: string,
  draft: ResourceDraft,
  actor: ResourceCmsActor
): Promise<{
  slug: string;
  subject: string;
  hasUnpublishedChanges: false;
  publishedAt: string;
  liveUrl: string;
} | null> {
  await connectDB();

  const existing = await getResourceCMSDocSnapshot(slug);
  if (!existing) return null;

  const liveBefore = extractCMSSections(existing);
  const liveAfter = extractCMSSections(draft);

  const publishedAt = new Date();
  const draftDoc = toDraftDocument(draft);

  await resources2Data.updateOne(
    { slug },
    {
      $set: {
        syllabus: draft.syllabus,
        notes: draft.notes,
        worksheets: draft.worksheets,
        tools: draft.tools,
        books: draft.books,
        youtubeChannel: draft.youtubeChannel,
        youtubePlaylist: draft.youtubePlaylist,
        draft: draftDoc,
        hasUnpublishedChanges: false,
        publishedAt,
      },
    }
  );

  const { recordPublishRevision } = await import("./resource-cms-revisions");
  await recordPublishRevision({
    slug,
    subject: existing.subject,
    actor,
    liveBefore,
    liveAfter,
  });

  return {
    slug,
    subject: existing.subject,
    hasUnpublishedChanges: false,
    publishedAt: publishedAt.toISOString(),
    liveUrl: `/resources/${slug}`,
  };
}
