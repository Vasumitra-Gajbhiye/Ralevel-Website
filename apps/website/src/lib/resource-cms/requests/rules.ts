// Who can do what with resource change requests. Pure functions: used by the
// API routes for enforcement and by the UI to decide which buttons to show.

import type { ResourceChangeRequestStatus } from "@/types/resourceChangeRequests";

/** How long an approval holds its lease while publishing. */
export const APPROVAL_LEASE_MS = 60_000;

export type ChangeRequestViewer = {
  userId: string;
  /** Has "Resource publishing" page access (heads and admins by default). */
  canPublish: boolean;
  /** Owner or admin: may review their own requests. */
  isAdmin: boolean;
};

export type ChangeRequestState = {
  status: ResourceChangeRequestStatus;
  authorUserId: string;
  approvingAt?: Date | string | null;
};

export type DraftEditMode =
  /** No open request: edit freely. */
  | "free"
  /** A publisher editing an open request; saves update it in review. */
  | "reviewer"
  /** The author revising after changes were requested. */
  | "author"
  /** Read-only for this person right now. */
  | "locked";

const isOpenStatus = (status: ResourceChangeRequestStatus) =>
  status === "in_review" || status === "changes_requested";

export function isApproving(
  req: Pick<ChangeRequestState, "approvingAt">,
  now = Date.now(),
): boolean {
  if (!req.approvingAt) return false;
  return now - new Date(req.approvingAt).getTime() < APPROVAL_LEASE_MS;
}

const isAuthor = (req: ChangeRequestState, viewer: ChangeRequestViewer) =>
  req.authorUserId === viewer.userId;

/** Reviewers can't act on their own request unless they're an owner or admin. */
const canReviewThis = (req: ChangeRequestState, viewer: ChangeRequestViewer) =>
  viewer.canPublish && (!isAuthor(req, viewer) || viewer.isAdmin);

export function draftEditMode(
  openRequest: ChangeRequestState | null,
  viewer: ChangeRequestViewer,
  now = Date.now(),
): DraftEditMode {
  if (!openRequest || !isOpenStatus(openRequest.status)) return "free";
  if (isApproving(openRequest, now)) return "locked";
  if (viewer.canPublish) return "reviewer";
  if (openRequest.status === "changes_requested" && isAuthor(openRequest, viewer)) {
    return "author";
  }
  return "locked";
}

/** Staff send their changes for review; publishers publish instead. */
export function canSubmit(
  openRequest: ChangeRequestState | null,
  viewer: ChangeRequestViewer,
): boolean {
  return !openRequest && !viewer.canPublish;
}

export function canPublishDirectly(
  openRequest: ChangeRequestState | null,
  viewer: ChangeRequestViewer,
): boolean {
  return !openRequest && viewer.canPublish;
}

export function canResubmit(req: ChangeRequestState, viewer: ChangeRequestViewer): boolean {
  return req.status === "changes_requested" && isAuthor(req, viewer);
}

export function canApprove(
  req: ChangeRequestState,
  viewer: ChangeRequestViewer,
  now = Date.now(),
): boolean {
  return req.status === "in_review" && canReviewThis(req, viewer) && !isApproving(req, now);
}

export function canRequestChanges(
  req: ChangeRequestState,
  viewer: ChangeRequestViewer,
  now = Date.now(),
): boolean {
  return req.status === "in_review" && canReviewThis(req, viewer) && !isApproving(req, now);
}

export function canReject(
  req: ChangeRequestState,
  viewer: ChangeRequestViewer,
  now = Date.now(),
): boolean {
  return isOpenStatus(req.status) && canReviewThis(req, viewer) && !isApproving(req, now);
}

export function canWithdraw(
  req: ChangeRequestState,
  viewer: ChangeRequestViewer,
  now = Date.now(),
): boolean {
  return isOpenStatus(req.status) && isAuthor(req, viewer) && !isApproving(req, now);
}

/** Anyone with Resource CMS access can join the conversation. */
export function canComment(): boolean {
  return true;
}

/** Bring a rejected or withdrawn request's content back into the draft. */
export function canRestore(
  req: ChangeRequestState,
  viewer: ChangeRequestViewer,
  subjectHasOpenRequest: boolean,
): boolean {
  return (
    (req.status === "rejected" || req.status === "withdrawn") &&
    !subjectHasOpenRequest &&
    (viewer.canPublish || isAuthor(req, viewer))
  );
}

export const STATUS_LABELS: Record<ResourceChangeRequestStatus, string> = {
  in_review: "In review",
  changes_requested: "Changes requested",
  approved: "Approved",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};
