import connectDB from "@/lib/mongodb";
import { buildPaginatedResponse, type PaginatedResult } from "@/lib/pagination";
import {
  contentHash,
  diffCMSSections,
  extractCMSSections,
  groupResourceCmsChanges,
  summarizeChanges,
} from "@/lib/resource-cms/diff";
import { ChangeRequestError } from "@/lib/resource-cms/requests/errors";
import {
  APPROVAL_LEASE_MS,
  draftEditMode,
  type ChangeRequestViewer,
  type DraftEditMode,
} from "@/lib/resource-cms/requests/rules";
import ResourceChangeRequest from "@/models/resourceChangeRequest";
import ResourceChangeRequestEvent from "@/models/resourceChangeRequestEvent";
import ResourceCmsRevision from "@/models/resourceCmsRevision";
import type {
  OpenResourceChangeRequest,
  ResourceChangeEventItem,
  ResourceChangeEventType,
  ResourceChangePerson,
  ResourceChangeRequestDetail,
  ResourceChangeRequestListItem,
  ResourceChangeRequestStatus,
} from "@/types/resourceChangeRequests";
import type {
  ResourceCmsActor,
  ResourceCmsChange,
  ResourceCMSSections,
} from "@/types/resources2";
import {
  getResourceCMSDocSnapshot,
  publishResourceCMSDraft,
  resetResourceCMSDraftToLive,
  resolveCMSDraft,
  saveResourceCMSDraft,
} from "./resource-cms";

// ---------------------------------------------------------------------------
// Types and helpers
// ---------------------------------------------------------------------------

type RequestDoc = {
  _id: unknown;
  number: number;
  slug: string;
  subject: string;
  author: ResourceChangePerson;
  contributors?: ResourceChangePerson[];
  title: string;
  description?: string;
  status: ResourceChangeRequestStatus;
  open: boolean;
  round: number;
  approvingAt?: Date | null;
  baseSnapshot: ResourceCMSSections;
  baseHash: string;
  proposedSnapshot: ResourceCMSSections;
  proposedHash: string;
  discardedDraftSnapshot?: ResourceCMSSections | null;
  summary?: string;
  changeCount?: number;
  lastActivityAt: Date;
  closedBy?: ResourceChangePerson | null;
  closedAt?: Date | null;
  closeNote?: string | null;
  createdAt: Date;
};

type EventDoc = {
  _id: unknown;
  type: ResourceChangeEventType;
  actor: ResourceChangePerson;
  body?: string;
  round?: number | null;
  snapshot?: ResourceCMSSections | null;
  changes?: ResourceCmsChange[];
  createdAt: Date;
};

const SNAPSHOT_FIELDS = "-baseSnapshot -proposedSnapshot -discardedDraftSnapshot";

const iso = (value: Date | string | null | undefined) =>
  value ? new Date(value).toISOString() : null;

const displayName = (person: ResourceChangePerson) => person.name || person.email;

const toActor = (person: ResourceChangePerson): ResourceCmsActor => ({
  userId: person.userId,
  email: person.email,
});

const meaningfulCount = (changes: ResourceCmsChange[]) =>
  groupResourceCmsChanges(changes).length;

/** The live page and the working draft of a subject, normalized. */
async function loadSubject(slug: string) {
  const doc = await getResourceCMSDocSnapshot(slug);
  if (!doc) throw new ChangeRequestError("not_found", 404, "Subject not found");
  return {
    doc,
    live: extractCMSSections(doc),
    draft: extractCMSSections(resolveCMSDraft(doc)),
  };
}

async function findRequest(number: number): Promise<RequestDoc> {
  await connectDB();
  const req = await ResourceChangeRequest.findOne({ number }).lean<RequestDoc | null>();
  if (!req) throw new ChangeRequestError("not_found", 404, "Request not found");
  return req;
}

async function logEvent(event: {
  requestId: unknown | null;
  slug: string;
  type: ResourceChangeEventType;
  actor: ResourceChangePerson;
  body?: string;
  round?: number | null;
  snapshot?: ResourceCMSSections | null;
  changes?: ResourceCmsChange[];
  proposedHash?: string | null;
}) {
  await ResourceChangeRequestEvent.create({
    ...event,
    body: event.body ?? "",
    changes: event.changes?.filter((c) => c.type !== "section_unchanged"),
  });
}

/** Explains why a conditional update on a request matched nothing. */
async function explainMiss(number: number, expected: string): Promise<never> {
  const req = await ResourceChangeRequest.findOne({ number })
    .select("status approvingAt")
    .lean<Pick<RequestDoc, "status" | "approvingAt"> | null>();
  if (!req) throw new ChangeRequestError("not_found", 404, "Request not found");
  if (
    req.approvingAt &&
    Date.now() - new Date(req.approvingAt).getTime() < APPROVAL_LEASE_MS
  ) {
    throw new ChangeRequestError("approving", 409, "This request is being published right now");
  }
  throw new ChangeRequestError(
    "wrong_status",
    409,
    `This request is no longer ${expected}. Refresh to see the latest.`,
    { status: req.status },
  );
}

const leaseFree = () => ({
  $or: [
    { approvingAt: null },
    { approvingAt: { $lt: new Date(Date.now() - APPROVAL_LEASE_MS) } },
  ],
});

function isDuplicateKey(error: unknown, field: string): boolean {
  const e = error as { code?: number; keyPattern?: Record<string, unknown> };
  return e?.code === 11000 && !!e.keyPattern && field in e.keyPattern;
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function getOpenChangeRequest(
  slug: string,
): Promise<OpenResourceChangeRequest | null> {
  await connectDB();
  const req = await ResourceChangeRequest.findOne({ slug, open: true })
    .select("_id number status author title approvingAt")
    .lean<Pick<RequestDoc, "_id" | "number" | "status" | "author" | "title" | "approvingAt"> | null>();
  if (!req) return null;

  const feedback = await ResourceChangeRequestEvent.findOne({
    requestId: req._id,
    type: "changes_requested",
  })
    .sort({ createdAt: -1 })
    .select("body actor createdAt")
    .lean<Pick<EventDoc, "body" | "actor" | "createdAt"> | null>();

  return {
    number: req.number,
    status: req.status as OpenResourceChangeRequest["status"],
    authorUserId: req.author.userId,
    authorName: displayName(req.author),
    title: req.title,
    approvingAt: iso(req.approvingAt),
    latestFeedback:
      req.status === "changes_requested" && feedback
        ? {
            body: feedback.body ?? "",
            by: displayName(feedback.actor),
            at: iso(feedback.createdAt)!,
          }
        : null,
  };
}

/** Open request status per subject, for the subject list badges. */
export async function getOpenRequestStatuses(
  slugs: string[],
): Promise<Record<string, { number: number; status: ResourceChangeRequestStatus }>> {
  if (slugs.length === 0) return {};
  await connectDB();
  const rows = await ResourceChangeRequest.find({ slug: { $in: slugs }, open: true })
    .select("slug number status")
    .lean<{ slug: string; number: number; status: ResourceChangeRequestStatus }[]>();
  return Object.fromEntries(rows.map((r) => [r.slug, { number: r.number, status: r.status }]));
}

/** The fields the permission rules need, or null if there's no such request. */
export async function getChangeRequestState(number: number): Promise<{
  slug: string;
  status: ResourceChangeRequestStatus;
  authorUserId: string;
  approvingAt: string | null;
} | null> {
  await connectDB();
  const req = await ResourceChangeRequest.findOne({ number })
    .select("slug status author approvingAt")
    .lean<Pick<RequestDoc, "slug" | "status" | "author" | "approvingAt"> | null>();
  if (!req) return null;
  return {
    slug: req.slug,
    status: req.status,
    authorUserId: req.author.userId,
    approvingAt: iso(req.approvingAt),
  };
}

export async function countRequestsNeedingReview(): Promise<number> {
  await connectDB();
  return ResourceChangeRequest.countDocuments({ open: true, status: "in_review" });
}

/** Open requests by this person, newest activity first (for "Your requests"). */
export async function listMyOpenRequests(
  userId: string,
): Promise<ResourceChangeRequestListItem[]> {
  await connectDB();
  const rows = await ResourceChangeRequest.find({ "author.userId": userId, open: true })
    .select(SNAPSHOT_FIELDS)
    .sort({ lastActivityAt: -1 })
    .limit(20)
    .lean<RequestDoc[]>();
  return rows.map(toListItem);
}

function toListItem(doc: RequestDoc): ResourceChangeRequestListItem {
  return {
    number: doc.number,
    slug: doc.slug,
    subject: doc.subject,
    title: doc.title,
    status: doc.status,
    open: doc.open,
    round: doc.round ?? 1,
    author: doc.author,
    summary: doc.summary ?? "",
    changeCount: doc.changeCount ?? 0,
    createdAt: iso(doc.createdAt)!,
    lastActivityAt: iso(doc.lastActivityAt)!,
    closedAt: iso(doc.closedAt),
    closedBy: doc.closedBy ?? null,
  };
}

export type ChangeRequestListFilters = {
  tab: "needs-review" | "open" | "closed" | "all";
  authorUserId?: string;
  slug?: string;
};

export async function listChangeRequests(params: {
  page: number;
  limit: number;
  skip: number;
  filters: ChangeRequestListFilters;
}): Promise<PaginatedResult<ResourceChangeRequestListItem>> {
  await connectDB();
  const { filters } = params;
  const query: Record<string, unknown> = {};
  if (filters.tab === "needs-review") Object.assign(query, { open: true, status: "in_review" });
  if (filters.tab === "open") query.open = true;
  if (filters.tab === "closed") query.open = false;
  if (filters.authorUserId) query["author.userId"] = filters.authorUserId;
  if (filters.slug) query.slug = filters.slug;

  const [rows, total] = await Promise.all([
    ResourceChangeRequest.find(query)
      .select(SNAPSHOT_FIELDS)
      .sort({ lastActivityAt: -1 })
      .skip(params.skip)
      .limit(params.limit)
      .lean<RequestDoc[]>(),
    ResourceChangeRequest.countDocuments(query),
  ]);

  return buildPaginatedResponse(rows.map(toListItem), total, params.page, params.limit);
}

export async function getChangeRequestDetail(
  number: number,
): Promise<ResourceChangeRequestDetail | null> {
  await connectDB();
  const req = await ResourceChangeRequest.findOne({ number }).lean<RequestDoc | null>();
  if (!req) return null;

  const [events, subject, otherOpen] = await Promise.all([
    ResourceChangeRequestEvent.find({ requestId: req._id })
      .sort({ createdAt: 1 })
      .lean<EventDoc[]>(),
    getResourceCMSDocSnapshot(req.slug),
    req.open
      ? Promise.resolve(null)
      : ResourceChangeRequest.exists({ slug: req.slug, open: true }),
  ]);

  // While open, compare with what's live now; once closed, with what was live
  // at submission (approved requests then show exactly what they published).
  const live = req.open && subject ? extractCMSSections(subject) : req.baseSnapshot;
  const changes = groupResourceCmsChanges(
    diffCMSSections(extractCMSSections(live), extractCMSSections(req.proposedSnapshot)),
  );

  const lastReview = [...events].reverse().find((e) => e.type === "changes_requested");
  const sinceLastReview =
    (req.round ?? 1) > 1 && lastReview?.snapshot
      ? groupResourceCmsChanges(
          diffCMSSections(
            extractCMSSections(lastReview.snapshot),
            extractCMSSections(req.proposedSnapshot),
          ),
        )
      : null;

  const draftHash = subject ? contentHash(extractCMSSections(resolveCMSDraft(subject))) : null;

  const eventItems: ResourceChangeEventItem[] = events.map((e) => ({
    id: String(e._id),
    type: e.type,
    actor: e.actor,
    body: e.body ?? "",
    round: e.round ?? null,
    createdAt: iso(e.createdAt)!,
    changes:
      e.type === "submitted" || e.type === "approved" || e.type === "published_directly"
        ? []
        : groupResourceCmsChanges(e.changes ?? []),
  }));

  return {
    ...toListItem(req),
    description: req.description ?? "",
    contributors: req.contributors ?? [],
    closeNote: req.closeNote ?? null,
    proposedHash: req.proposedHash,
    approvingAt: iso(req.approvingAt),
    changes,
    sinceLastReview,
    draftDiffers: req.open && draftHash !== null && draftHash !== req.proposedHash,
    hasDiscardedDraft: !!req.discardedDraftSnapshot,
    subjectHasOtherOpenRequest: !!otherOpen,
    events: eventItems,
  };
}

// ---------------------------------------------------------------------------
// Draft lock
// ---------------------------------------------------------------------------

/**
 * Throws 409 when this person can't change the subject's draft right now.
 * Returns the edit mode so callers know whether a save updates a review.
 */
export async function assertDraftEditable(
  slug: string,
  viewer: ChangeRequestViewer,
): Promise<{ mode: DraftEditMode; openRequest: OpenResourceChangeRequest | null }> {
  const openRequest = await getOpenChangeRequest(slug);
  const mode = draftEditMode(
    openRequest
      ? {
          status: openRequest.status,
          authorUserId: openRequest.authorUserId,
          approvingAt: openRequest.approvingAt,
        }
      : null,
    viewer,
  );
  if (mode === "locked" && openRequest) {
    const why =
      openRequest.status === "in_review"
        ? `is in review (request #${openRequest.number})`
        : `is being revised by ${openRequest.authorName} (request #${openRequest.number})`;
    throw new ChangeRequestError("draft_locked", 409, `This subject ${why}, so it can't be edited right now.`, {
      requestNumber: openRequest.number,
    });
  }
  return { mode, openRequest };
}

/**
 * After a reviewer saves the draft of a request that's in review, the saved
 * content becomes the proposal, and the timeline shows what they changed.
 */
export async function recordReviewerEdit(slug: string, actor: ResourceChangePerson) {
  await connectDB();
  const req = await ResourceChangeRequest.findOne({ slug, open: true, status: "in_review" })
    .select("_id number round proposedSnapshot proposedHash")
    .lean<Pick<RequestDoc, "_id" | "number" | "round" | "proposedSnapshot" | "proposedHash"> | null>();
  if (!req) return;

  const { live, draft } = await loadSubject(slug);
  const hash = contentHash(draft);
  if (hash === req.proposedHash) return;

  const fromLive = diffCMSSections(live, draft);
  const updated = await ResourceChangeRequest.findOneAndUpdate(
    { _id: req._id, status: "in_review", proposedHash: req.proposedHash, ...leaseFree() },
    {
      $set: {
        proposedSnapshot: draft,
        proposedHash: hash,
        summary: summarizeChanges(fromLive),
        changeCount: meaningfulCount(fromLive),
        lastActivityAt: new Date(),
      },
    },
  );
  if (!updated) return;

  await logEvent({
    requestId: req._id,
    slug,
    type: "reviewer_edited",
    actor,
    round: req.round,
    snapshot: draft,
    changes: diffCMSSections(extractCMSSections(req.proposedSnapshot), draft),
    proposedHash: hash,
  });
}

// ---------------------------------------------------------------------------
// Workflow
// ---------------------------------------------------------------------------

async function nextRequestNumber(): Promise<number> {
  const last = await ResourceChangeRequest.findOne({})
    .sort({ number: -1 })
    .select("number")
    .lean<{ number: number } | null>();
  return (last?.number ?? 0) + 1;
}

/** People who saved this subject's draft since it was last published. */
async function draftContributors(
  slug: string,
  since: Date | undefined,
): Promise<ResourceChangePerson[]> {
  const rows = await ResourceCmsRevision.aggregate<{ _id: string; email: string }>([
    {
      $match: {
        slug,
        action: { $in: ["save_draft", "restore"] },
        ...(since ? { createdAt: { $gt: since } } : {}),
      },
    },
    { $group: { _id: "$actor.userId", email: { $first: "$actor.email" } } },
  ]);
  return rows.map((r) => ({ userId: r._id, email: r.email, name: null }));
}

export async function submitChangeRequest(params: {
  slug: string;
  title: string;
  description: string;
  actor: ResourceChangePerson;
}) {
  await connectDB();
  await ResourceChangeRequest.init();

  const { doc, live, draft } = await loadSubject(params.slug);
  const baseHash = contentHash(live);
  const proposedHash = contentHash(draft);
  if (baseHash === proposedHash) {
    throw new ChangeRequestError("no_changes", 400, "There are no changes to submit. Edit and save the draft first.");
  }

  const fromLive = diffCMSSections(live, draft);
  const contributors = await draftContributors(params.slug, doc.publishedAt);
  if (!contributors.some((c) => c.userId === params.actor.userId)) {
    contributors.unshift(params.actor);
  }

  let created: { _id: unknown; number: number } | null = null;
  for (let attempt = 0; attempt < 3 && !created; attempt++) {
    const now = new Date();
    try {
      created = await ResourceChangeRequest.create({
        number: await nextRequestNumber(),
        slug: params.slug,
        subject: doc.subject,
        author: params.actor,
        contributors,
        title: params.title,
        description: params.description,
        status: "in_review",
        open: true,
        round: 1,
        baseSnapshot: live,
        baseHash,
        proposedSnapshot: draft,
        proposedHash,
        summary: summarizeChanges(fromLive),
        changeCount: meaningfulCount(fromLive),
        lastActivityAt: now,
      });
    } catch (error) {
      if (isDuplicateKey(error, "slug")) {
        const open = await getOpenChangeRequest(params.slug);
        throw new ChangeRequestError(
          "open_request_exists",
          409,
          open
            ? `Request #${open.number} is already open for this subject.`
            : "A request is already open for this subject.",
          { requestNumber: open?.number },
        );
      }
      if (!isDuplicateKey(error, "number")) throw error;
    }
  }
  if (!created) throw new Error("Couldn't allocate a request number");

  await logEvent({
    requestId: created._id,
    slug: params.slug,
    type: "submitted",
    actor: params.actor,
    body: params.description,
    round: 1,
    snapshot: draft,
    changes: fromLive,
    proposedHash,
  });

  return { number: created.number, slug: params.slug, subject: doc.subject };
}

export async function resubmitChangeRequest(params: {
  number: number;
  note: string;
  actor: ResourceChangePerson;
}) {
  const req = await findRequest(params.number);
  const { live, draft } = await loadSubject(req.slug);
  const proposedHash = contentHash(draft);
  if (proposedHash === contentHash(live)) {
    throw new ChangeRequestError("no_changes", 400, "The draft now matches the live page, so there's nothing to review. Withdraw the request instead.");
  }

  const fromLive = diffCMSSections(live, draft);
  const updated = await ResourceChangeRequest.findOneAndUpdate(
    { _id: req._id, status: "changes_requested", ...leaseFree() },
    {
      $set: {
        status: "in_review",
        proposedSnapshot: draft,
        proposedHash,
        summary: summarizeChanges(fromLive),
        changeCount: meaningfulCount(fromLive),
        lastActivityAt: new Date(),
      },
      $inc: { round: 1 },
    },
    { new: true },
  ).lean<RequestDoc | null>();
  if (!updated) await explainMiss(params.number, "waiting for changes");

  await logEvent({
    requestId: req._id,
    slug: req.slug,
    type: "resubmitted",
    actor: params.actor,
    body: params.note,
    round: updated!.round,
    snapshot: draft,
    changes: diffCMSSections(extractCMSSections(req.proposedSnapshot), draft),
    proposedHash,
  });

  return { number: req.number, slug: req.slug, subject: req.subject, author: req.author };
}

export async function requestChanges(params: {
  number: number;
  note: string;
  actor: ResourceChangePerson;
}) {
  const req = await findRequest(params.number);
  const updated = await ResourceChangeRequest.findOneAndUpdate(
    { _id: req._id, status: "in_review", ...leaseFree() },
    { $set: { status: "changes_requested", lastActivityAt: new Date() } },
  );
  if (!updated) await explainMiss(params.number, "in review");

  await logEvent({
    requestId: req._id,
    slug: req.slug,
    type: "changes_requested",
    actor: params.actor,
    body: params.note,
    round: req.round,
    snapshot: req.proposedSnapshot,
    proposedHash: req.proposedHash,
  });

  return { number: req.number, slug: req.slug, subject: req.subject, title: req.title, author: req.author };
}

export async function approveChangeRequest(params: {
  number: number;
  expectedHash: string;
  note: string;
  actor: ResourceChangePerson;
}) {
  await connectDB();
  const leased = await ResourceChangeRequest.findOneAndUpdate(
    { number: params.number, status: "in_review", proposedHash: params.expectedHash, ...leaseFree() },
    { $set: { approvingAt: new Date() } },
    { new: true },
  ).lean<RequestDoc | null>();

  if (!leased) {
    const req = await findRequest(params.number);
    if (req.status === "in_review" && req.proposedHash !== params.expectedHash) {
      throw new ChangeRequestError("stale", 409, "This request changed after you opened it. Refresh and review the latest version.");
    }
    await explainMiss(params.number, "in review");
  }
  const req = leased!;
  const release = () =>
    ResourceChangeRequest.updateOne({ _id: req._id }, { $set: { approvingAt: null } });

  try {
    const { draft } = await loadSubject(req.slug);
    if (contentHash(draft) !== req.proposedHash) {
      throw new ChangeRequestError("stale", 409, "The draft changed after this version was submitted. Refresh and review the latest version.");
    }

    const published = await publishResourceCMSDraft(
      req.slug,
      { ...extractCMSSections(req.proposedSnapshot), updatedBy: toActor(params.actor) },
      toActor(params.actor),
      { message: `Approved #${req.number}: ${req.title}`, requestId: String(req._id) },
    );
    if (!published) throw new ChangeRequestError("not_found", 404, "Subject not found");

    const now = new Date();
    await ResourceChangeRequest.updateOne(
      { _id: req._id },
      {
        $set: {
          status: "approved",
          open: false,
          approvingAt: null,
          closedBy: params.actor,
          closedAt: now,
          closeNote: params.note || null,
          publishedRevisionId: published.revisionId,
          lastActivityAt: now,
        },
      },
    );

    await logEvent({
      requestId: req._id,
      slug: req.slug,
      type: "approved",
      actor: params.actor,
      body: params.note,
      round: req.round,
      snapshot: req.proposedSnapshot,
      changes: diffCMSSections(published.liveBefore, published.liveAfter),
      proposedHash: req.proposedHash,
    });

    return {
      number: req.number,
      slug: req.slug,
      subject: req.subject,
      title: req.title,
      author: req.author,
      liveUrl: published.liveUrl,
    };
  } catch (error) {
    await release();
    throw error;
  }
}

export async function rejectChangeRequest(params: {
  number: number;
  note: string;
  actor: ResourceChangePerson;
}) {
  const req = await findRequest(params.number);
  const { draft } = await loadSubject(req.slug);
  const draftHash = contentHash(draft);
  const now = new Date();

  const updated = await ResourceChangeRequest.findOneAndUpdate(
    { _id: req._id, open: true, ...leaseFree() },
    {
      $set: {
        status: "rejected",
        open: false,
        closedBy: params.actor,
        closedAt: now,
        closeNote: params.note,
        lastActivityAt: now,
        // Keep edits the author made after the last review, so restoring
        // brings back their latest work rather than the reviewed version.
        discardedDraftSnapshot:
          draftHash !== req.proposedHash && draftHash !== req.baseHash ? draft : null,
      },
    },
  );
  if (!updated) await explainMiss(params.number, "open");

  await resetResourceCMSDraftToLive(req.slug, toActor(params.actor), {
    message: `Draft reset: request #${req.number} was rejected`,
    requestId: String(req._id),
  });

  await logEvent({
    requestId: req._id,
    slug: req.slug,
    type: "rejected",
    actor: params.actor,
    body: params.note,
    round: req.round,
    snapshot: req.proposedSnapshot,
    proposedHash: req.proposedHash,
  });

  return { number: req.number, slug: req.slug, subject: req.subject, title: req.title, author: req.author };
}

export async function withdrawChangeRequest(params: {
  number: number;
  note: string;
  actor: ResourceChangePerson;
}) {
  const req = await findRequest(params.number);
  const now = new Date();
  const updated = await ResourceChangeRequest.findOneAndUpdate(
    { _id: req._id, open: true, ...leaseFree() },
    {
      $set: {
        status: "withdrawn",
        open: false,
        closedBy: params.actor,
        closedAt: now,
        closeNote: params.note || null,
        lastActivityAt: now,
      },
    },
  );
  if (!updated) await explainMiss(params.number, "open");

  await logEvent({
    requestId: req._id,
    slug: req.slug,
    type: "withdrawn",
    actor: params.actor,
    body: params.note,
    round: req.round,
  });

  return { number: req.number, slug: req.slug };
}

/** Puts a rejected or withdrawn request's content back into the draft. */
export async function restoreChangeRequest(params: {
  number: number;
  actor: ResourceChangePerson;
}) {
  const req = await findRequest(params.number);
  if (req.status !== "rejected" && req.status !== "withdrawn") {
    throw new ChangeRequestError("wrong_status", 409, "Only rejected or withdrawn requests can be restored.");
  }
  const open = await getOpenChangeRequest(req.slug);
  if (open) {
    throw new ChangeRequestError(
      "open_request_exists",
      409,
      `Request #${open.number} is open for this subject. Restore after it's closed.`,
      { requestNumber: open.number },
    );
  }

  const content = extractCMSSections(req.discardedDraftSnapshot ?? req.proposedSnapshot);
  const saved = await saveResourceCMSDraft(
    req.slug,
    { ...content, updatedBy: toActor(params.actor) },
    {
      actor: toActor(params.actor),
      message: `Restored from request #${req.number}`,
      requestId: String(req._id),
    },
  );
  if (!saved) throw new ChangeRequestError("not_found", 404, "Subject not found");

  await ResourceChangeRequest.updateOne({ _id: req._id }, { $set: { lastActivityAt: new Date() } });
  await logEvent({
    requestId: req._id,
    slug: req.slug,
    type: "restored",
    actor: params.actor,
    round: req.round,
  });

  return { number: req.number, slug: req.slug };
}

export async function addChangeRequestComment(params: {
  number: number;
  body: string;
  actor: ResourceChangePerson;
}) {
  const req = await findRequest(params.number);
  await ResourceChangeRequest.updateOne({ _id: req._id }, { $set: { lastActivityAt: new Date() } });
  await logEvent({
    requestId: req._id,
    slug: req.slug,
    type: "comment",
    actor: params.actor,
    body: params.body,
    round: req.round,
  });
  return { number: req.number, slug: req.slug, subject: req.subject, title: req.title, author: req.author };
}

/** Permanent record of a publish that didn't go through review. */
export async function logDirectPublish(params: {
  slug: string;
  actor: ResourceChangePerson;
  liveBefore: ResourceCMSSections;
  liveAfter: ResourceCMSSections;
}) {
  await connectDB();
  await logEvent({
    requestId: null,
    slug: params.slug,
    type: "published_directly",
    actor: params.actor,
    snapshot: params.liveAfter,
    changes: diffCMSSections(params.liveBefore, params.liveAfter),
    proposedHash: contentHash(params.liveAfter),
  });
}
