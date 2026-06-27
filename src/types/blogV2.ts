export type BlogV2Status =
  | "draft"
  | "in_review"
  | "changes_requested"
  | "published";

export type BlogV2ReviewType = "initial" | "update";

export type BlogV2ReviewAction =
  | "submitted"
  | "approved"
  | "rejected"
  | "restored";

export type BlogV2Metadata = {
  title?: string;
  author?: string;
  date?: string;
  tag?: string;
  image?: string;
  description?: string;
  readTimeMinutes?: number;
  authorBio?: string;
  authorFollowers?: number;
};

export type BlogV2ContentSnapshot = {
  title: string;
  metadata: BlogV2Metadata;
  content: unknown[];
  updatedAt?: Date | string;
};

export type BlogV2DraftLayer = BlogV2ContentSnapshot;

export type BlogV2PendingReview = BlogV2ContentSnapshot & {
  submittedAt?: Date | string;
};

export type BlogV2VersionSummary = {
  _id: string;
  versionNumber: number;
  title: string;
  approvedAt: string;
  approvedAtLabel: string;
  approvedById: string;
  approvedByName: string;
  reviewType?: BlogV2ReviewType | null;
};

export type BlogV2HistoryTimelineItem = {
  _id: string;
  action: BlogV2ReviewAction;
  actorId: string;
  actorName: string;
  createdAt: string;
  createdAtLabel: string;
  note?: string | null;
  reviewType?: BlogV2ReviewType | null;
  versionId?: string | null;
  versionNumber?: number | null;
  hasSubmissionSnapshot: boolean;
};

export type BlogV2GlobalHistoryEntry = {
  _id: string;
  blogId: string;
  blogTitle: string;
  action: BlogV2ReviewAction;
  actorId: string;
  actorName: string;
  createdAt: string;
  createdAtLabel: string;
  note?: string | null;
  reviewType?: BlogV2ReviewType | null;
  versionId?: string | null;
  versionNumber?: number | null;
  hasSubmissionSnapshot: boolean;
};
