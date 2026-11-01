import type { ResourceCmsGroupedChange } from "@/types/resources2";

export type ResourceChangeRequestStatus =
  | "in_review"
  | "changes_requested"
  | "approved"
  | "rejected"
  | "withdrawn";

export type ResourceChangeEventType =
  | "submitted"
  | "resubmitted"
  | "reviewer_edited"
  | "comment"
  | "changes_requested"
  | "approved"
  | "rejected"
  | "withdrawn"
  | "restored"
  | "published_directly";

export type ResourceChangePerson = {
  userId: string;
  email: string;
  name?: string | null;
};

/** The open request on a subject, as the editor and subject list see it. */
export type OpenResourceChangeRequest = {
  number: number;
  status: Extract<ResourceChangeRequestStatus, "in_review" | "changes_requested">;
  authorUserId: string;
  authorName: string;
  title: string;
  approvingAt: string | null;
  /** Latest "request changes" note, shown to the author in the editor. */
  latestFeedback: { body: string; by: string; at: string } | null;
};

export type ResourceChangeRequestListItem = {
  number: number;
  slug: string;
  subject: string;
  title: string;
  status: ResourceChangeRequestStatus;
  open: boolean;
  round: number;
  author: ResourceChangePerson;
  summary: string;
  changeCount: number;
  createdAt: string;
  lastActivityAt: string;
  closedAt: string | null;
  closedBy: ResourceChangePerson | null;
};

export type ResourceChangeEventItem = {
  id: string;
  type: ResourceChangeEventType;
  actor: ResourceChangePerson;
  body: string;
  round: number | null;
  createdAt: string;
  changes: ResourceCmsGroupedChange[];
};

export type ResourceChangeRequestDetail = ResourceChangeRequestListItem & {
  description: string;
  contributors: ResourceChangePerson[];
  closeNote: string | null;
  proposedHash: string;
  approvingAt: string | null;
  /** What this request changes on the live page. */
  changes: ResourceCmsGroupedChange[];
  /** What changed since the last "request changes", for round 2+. */
  sinceLastReview: ResourceCmsGroupedChange[] | null;
  /** The working draft differs from what's under review (author is revising). */
  draftDiffers: boolean;
  /** A rejection set aside newer draft edits; restoring brings them back. */
  hasDiscardedDraft: boolean;
  /** Another request is open on the same subject (blocks restoring). */
  subjectHasOtherOpenRequest: boolean;
  events: ResourceChangeEventItem[];
};
