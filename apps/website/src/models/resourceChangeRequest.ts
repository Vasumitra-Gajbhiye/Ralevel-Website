import mongoose from "mongoose";

// A staff member's proposed change to one resource subject page, reviewed by
// someone with Resource publishing access. Kept forever (no TTL): this is the
// permanent record of who proposed, reviewed and published what.

const personSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    email: { type: String, required: true },
    name: { type: String, default: null },
  },
  { _id: false },
);

export const RESOURCE_CHANGE_REQUEST_STATUSES = [
  "in_review",
  "changes_requested",
  "approved",
  "rejected",
  "withdrawn",
] as const;

const resourceChangeRequestSchema = new mongoose.Schema(
  {
    /** Human-friendly #N, unique across all subjects. */
    number: { type: Number, required: true },
    slug: { type: String, required: true },
    subject: { type: String, required: true },
    author: { type: personSchema, required: true },
    /** Everyone who saved the draft between the last publish and submitting. */
    contributors: { type: [personSchema], default: [] },
    title: { type: String, required: true, maxlength: 120 },
    description: { type: String, default: "", maxlength: 2000 },
    status: {
      type: String,
      enum: RESOURCE_CHANGE_REQUEST_STATUSES,
      required: true,
    },
    /** True while in review or changes requested; one open request per subject. */
    open: { type: Boolean, required: true },
    round: { type: Number, default: 1 },
    /** Short lease taken while an approval publishes, so two can't race. */
    approvingAt: { type: Date, default: null },

    /** The live page when the request was submitted. */
    baseSnapshot: { type: mongoose.Schema.Types.Mixed, required: true },
    baseHash: { type: String, required: true },
    /** The content under review (updated on resubmit and reviewer edits). */
    proposedSnapshot: { type: mongoose.Schema.Types.Mixed, required: true },
    proposedHash: { type: String, required: true },
    /** Draft edits made after the last review that a rejection threw away. */
    discardedDraftSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
    summary: { type: String, default: "" },
    changeCount: { type: Number, default: 0 },

    lastActivityAt: { type: Date, required: true },
    closedBy: { type: personSchema, default: null },
    closedAt: { type: Date, default: null },
    closeNote: { type: String, default: null },
    publishedRevisionId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true },
);

resourceChangeRequestSchema.index({ number: 1 }, { unique: true });
resourceChangeRequestSchema.index(
  { slug: 1 },
  { unique: true, partialFilterExpression: { open: true } },
);
resourceChangeRequestSchema.index({ open: 1, status: 1, lastActivityAt: -1 });
resourceChangeRequestSchema.index({ "author.userId": 1, open: 1, lastActivityAt: -1 });
resourceChangeRequestSchema.index({ slug: 1, lastActivityAt: -1 });

const ResourceChangeRequest =
  mongoose.models.ResourceChangeRequest ||
  mongoose.model("ResourceChangeRequest", resourceChangeRequestSchema);

export default ResourceChangeRequest;
