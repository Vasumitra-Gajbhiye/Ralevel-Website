import mongoose from "mongoose";

// Timeline of a change request: submissions, reviews, comments. Also records
// direct publishes (requestId null) so every live change has a permanent trail.

export const RESOURCE_CHANGE_EVENT_TYPES = [
  "submitted",
  "resubmitted",
  "reviewer_edited",
  "comment",
  "changes_requested",
  "approved",
  "rejected",
  "withdrawn",
  "restored",
  "published_directly",
] as const;

const actorSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    email: { type: String, required: true },
    name: { type: String, default: null },
  },
  { _id: false },
);

const resourceChangeRequestEventSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResourceChangeRequest",
      default: null,
    },
    slug: { type: String, required: true },
    type: { type: String, enum: RESOURCE_CHANGE_EVENT_TYPES, required: true },
    actor: { type: actorSchema, required: true },
    body: { type: String, default: "" },
    round: { type: Number, default: null },
    /** Content at this point (submissions, reviewer edits, reviews). */
    snapshot: { type: mongoose.Schema.Types.Mixed, default: null },
    /** Diff this event introduced (vs live, or vs the previous proposal). */
    changes: { type: [mongoose.Schema.Types.Mixed], default: undefined },
    proposedHash: { type: String, default: null },
  },
  { timestamps: true },
);

resourceChangeRequestEventSchema.index({ requestId: 1, createdAt: 1 });
resourceChangeRequestEventSchema.index({ slug: 1, createdAt: -1 });

const ResourceChangeRequestEvent =
  mongoose.models.ResourceChangeRequestEvent ||
  mongoose.model("ResourceChangeRequestEvent", resourceChangeRequestEventSchema);

export default ResourceChangeRequestEvent;
