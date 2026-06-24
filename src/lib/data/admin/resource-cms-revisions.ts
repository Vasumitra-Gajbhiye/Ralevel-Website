import connectDB from "@/lib/mongodb";
import { buildPaginatedResponse, type PaginatedResult } from "@/lib/pagination";
import {
  contentHash,
  diffCMSSections,
  extractCMSSections,
  summarizeChanges,
} from "@/lib/resource-cms/diff";
import type { ResourceCMSHistoryFilters } from "@/lib/resource-cms/history-filters";
import ResourceCmsRevision from "@/models/resourceCmsRevision";
import type {
  ResourceCmsActor,
  ResourceCmsChange,
  ResourceCmsRevisionAction,
  ResourceCmsRevisionDetail,
  ResourceCmsRevisionKind,
  ResourceCmsRevisionListItem,
  ResourceCMSSections,
  ResourceDraft,
} from "@/types/resources2";
import { saveResourceCMSDraft } from "./resource-cms";

const MAX_BACKUPS_PER_SLUG = 30;
const BACKUP_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

type RevisionDoc = {
  _id: unknown;
  slug: string;
  subject: string;
  kind: ResourceCmsRevisionKind;
  action: ResourceCmsRevisionAction;
  actor: ResourceCmsActor;
  createdAt: Date;
  contentHash: string;
  snapshotScope: "draft" | "live";
  snapshot: ResourceCMSSections;
  changes?: ResourceCmsChange[];
  restoredFromId?: unknown;
  message?: string;
};

function toIsoString(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function serializeRevisionListItem(
  doc: RevisionDoc,
): ResourceCmsRevisionListItem {
  const changes = Array.isArray(doc.changes) ? doc.changes : [];
  return {
    _id: String(doc._id),
    slug: doc.slug,
    subject: doc.subject,
    kind: doc.kind,
    action: doc.action,
    actor: doc.actor,
    createdAt: toIsoString(doc.createdAt),
    snapshotScope: doc.snapshotScope,
    contentHash: doc.contentHash,
    summary: summarizeChanges(changes),
    restoredFromId: doc.restoredFromId ? String(doc.restoredFromId) : undefined,
    message: doc.message,
  };
}

function serializeRevisionDetail(doc: RevisionDoc): ResourceCmsRevisionDetail {
  return {
    ...serializeRevisionListItem(doc),
    changes: Array.isArray(doc.changes) ? doc.changes : [],
    hasSnapshot: true,
  };
}

async function pruneSubjectBackups(slug: string): Promise<void> {
  const cutoff = new Date(Date.now() - BACKUP_MAX_AGE_MS);

  await ResourceCmsRevision.deleteMany({
    slug,
    kind: "backup",
    createdAt: { $lt: cutoff },
  });

  const backups = await ResourceCmsRevision.find({ slug, kind: "backup" })
    .sort({ createdAt: -1 })
    .select("_id")
    .lean<{ _id: unknown }[]>();

  if (backups.length <= MAX_BACKUPS_PER_SLUG) return;

  const excess = backups.slice(MAX_BACKUPS_PER_SLUG).map((b) => b._id);
  await ResourceCmsRevision.deleteMany({ _id: { $in: excess } });
}

async function getLatestBackupHash(slug: string): Promise<string | null> {
  const latest = await ResourceCmsRevision.findOne({ slug, kind: "backup" })
    .sort({ createdAt: -1 })
    .select("contentHash")
    .lean<{ contentHash?: string }>();

  return latest?.contentHash ?? null;
}

async function createBackupIfNeeded(params: {
  slug: string;
  subject: string;
  actor: ResourceCmsActor;
  liveAfter: ResourceCMSSections;
}): Promise<void> {
  const hash = contentHash(params.liveAfter);
  const latestHash = await getLatestBackupHash(params.slug);
  if (latestHash === hash) return;

  await ResourceCmsRevision.create({
    slug: params.slug,
    subject: params.subject,
    kind: "backup",
    action: "publish",
    actor: params.actor,
    contentHash: hash,
    snapshotScope: "live",
    snapshot: params.liveAfter,
    changes: [],
  });

  await pruneSubjectBackups(params.slug);
}

export async function recordDraftSaveRevision(params: {
  slug: string;
  subject: string;
  actor: ResourceCmsActor;
  before: ResourceCMSSections;
  after: ResourceCMSSections;
}): Promise<void> {
  const beforeHash = contentHash(params.before);
  const afterHash = contentHash(params.after);
  if (beforeHash === afterHash) return;

  await connectDB();

  const changes = diffCMSSections(params.before, params.after);

  await ResourceCmsRevision.create({
    slug: params.slug,
    subject: params.subject,
    kind: "edit",
    action: "save_draft",
    actor: params.actor,
    contentHash: afterHash,
    snapshotScope: "draft",
    snapshot: params.after,
    changes,
  });
}

export async function recordPublishRevision(params: {
  slug: string;
  subject: string;
  actor: ResourceCmsActor;
  liveBefore: ResourceCMSSections;
  liveAfter: ResourceCMSSections;
}): Promise<void> {
  await connectDB();

  const afterHash = contentHash(params.liveAfter);
  const changes = diffCMSSections(params.liveBefore, params.liveAfter);

  await ResourceCmsRevision.create({
    slug: params.slug,
    subject: params.subject,
    kind: "edit",
    action: "publish",
    actor: params.actor,
    contentHash: afterHash,
    snapshotScope: "live",
    snapshot: params.liveAfter,
    changes,
  });

  await createBackupIfNeeded({
    slug: params.slug,
    subject: params.subject,
    actor: params.actor,
    liveAfter: params.liveAfter,
  });
}

export async function recordRestoreRevision(params: {
  slug: string;
  subject: string;
  actor: ResourceCmsActor;
  before: ResourceCMSSections;
  after: ResourceCMSSections;
  restoredFromId: string;
  message?: string;
}): Promise<void> {
  await connectDB();

  const changes = diffCMSSections(params.before, params.after);

  await ResourceCmsRevision.create({
    slug: params.slug,
    subject: params.subject,
    kind: "edit",
    action: "restore",
    actor: params.actor,
    contentHash: contentHash(params.after),
    snapshotScope: "draft",
    snapshot: params.after,
    changes,
    restoredFromId: params.restoredFromId,
    message: params.message,
  });
}

function buildRevisionQueryFilter(
  filters: ResourceCMSHistoryFilters,
): Record<string, unknown> {
  const filter: Record<string, unknown> = {};

  if (filters.slug) filter.slug = filters.slug;
  if (filters.kind) filter.kind = filters.kind;
  if (filters.action) filter.action = filters.action;
  if (filters.actorUserId) filter["actor.userId"] = filters.actorUserId;
  if (filters.snapshotScope) filter.snapshotScope = filters.snapshotScope;

  const createdAt: Record<string, Date> = {};
  if (filters.from) {
    const fromDate = new Date(`${filters.from}T00:00:00.000`);
    if (!Number.isNaN(fromDate.getTime())) {
      createdAt.$gte = fromDate;
    }
  }
  if (filters.to) {
    const toDate = new Date(`${filters.to}T23:59:59.999`);
    if (!Number.isNaN(toDate.getTime())) {
      createdAt.$lte = toDate;
    }
  }
  if (Object.keys(createdAt).length > 0) {
    filter.createdAt = createdAt;
  }

  return filter;
}

export async function listResourceCMSRevisionActors(): Promise<
  ResourceCmsActor[]
> {
  await connectDB();

  const actors = await ResourceCmsRevision.aggregate<{
    _id: string;
    email: string;
  }>([
    {
      $group: {
        _id: "$actor.userId",
        email: { $first: "$actor.email" },
      },
    },
    { $sort: { email: 1 } },
  ]);

  return actors.map((actor) => ({
    userId: actor._id,
    email: actor.email,
  }));
}

export async function listResourceCMSRevisions(params: {
  page: number;
  limit: number;
  skip: number;
  filters?: ResourceCMSHistoryFilters;
}): Promise<PaginatedResult<ResourceCmsRevisionDetail>> {
  await connectDB();

  const filter = buildRevisionQueryFilter(params.filters ?? {});

  const [data, total] = await Promise.all([
    ResourceCmsRevision.find(filter)
      .select("-snapshot")
      .sort({ createdAt: -1 })
      .skip(params.skip)
      .limit(params.limit)
      .lean<RevisionDoc[]>(),
    ResourceCmsRevision.countDocuments(filter),
  ]);

  return buildPaginatedResponse(
    data.map(serializeRevisionDetail),
    total,
    params.page,
    params.limit,
  );
}

export async function getResourceCMSRevision(
  id: string,
): Promise<ResourceCmsRevisionDetail | null> {
  await connectDB();

  const doc = await ResourceCmsRevision.findById(id).lean<RevisionDoc | null>();
  if (!doc) return null;

  return serializeRevisionDetail(doc);
}

export async function restoreResourceCMSRevision(params: {
  slug: string;
  revisionId: string;
  actor: ResourceCmsActor;
  message?: string;
}): Promise<{
  slug: string;
  hasUnpublishedChanges: true;
  draft: ResourceDraft;
} | null> {
  await connectDB();

  const revision = await ResourceCmsRevision.findById(
    params.revisionId,
  ).lean<RevisionDoc | null>();

  if (!revision || revision.slug !== params.slug) {
    return null;
  }

  const { getResourceCMSDocSnapshot, resolveCMSDraft } =
    await import("./resource-cms");

  const doc = await getResourceCMSDocSnapshot(params.slug);
  if (!doc) return null;

  const beforeDraft = extractCMSSections(resolveCMSDraft(doc));
  const restoredSections = extractCMSSections(revision.snapshot);

  const nextDraft: ResourceDraft = {
    ...restoredSections,
    updatedBy: {
      userId: params.actor.userId,
      email: params.actor.email,
    },
  };

  const result = await saveResourceCMSDraft(params.slug, nextDraft, {
    actor: params.actor,
    skipRevisionLog: true,
  });

  if (!result) return null;

  await recordRestoreRevision({
    slug: params.slug,
    subject: doc.subject,
    actor: params.actor,
    before: beforeDraft,
    after: restoredSections,
    restoredFromId: params.revisionId,
    message: params.message,
  });

  return result;
}
