export type BlogV2Status =
  | "draft"
  | "in_review"
  | "changes_requested"
  | "published";

export type BlogV2ReviewType = "initial" | "update";

export type BlogV2ReviewAction = "submitted" | "approved" | "rejected";

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
