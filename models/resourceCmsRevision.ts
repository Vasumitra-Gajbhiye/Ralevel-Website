import mongoose from "mongoose";

const actorSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    email: { type: String, required: true },
  },
  { _id: false }
);

const resourceCmsRevisionSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, index: true },
    subject: { type: String, required: true },
    kind: { type: String, enum: ["edit", "backup"], required: true },
    action: {
      type: String,
      enum: ["save_draft", "publish", "restore"],
      required: true,
    },
    actor: { type: actorSchema, required: true },
    contentHash: { type: String, required: true },
    snapshotScope: { type: String, enum: ["draft", "live"], required: true },
    snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
    changes: { type: [mongoose.Schema.Types.Mixed], default: [] },
    restoredFromId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResourceCmsRevision",
    },
    message: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

resourceCmsRevisionSchema.index({ slug: 1, createdAt: -1 });
resourceCmsRevisionSchema.index({ createdAt: -1 });
resourceCmsRevisionSchema.index({ "actor.userId": 1, createdAt: -1 });
resourceCmsRevisionSchema.index({ slug: 1, kind: 1, contentHash: 1, createdAt: -1 });
resourceCmsRevisionSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 7776000,
    partialFilterExpression: { kind: "edit" },
  }
);

const ResourceCmsRevision =
  mongoose.models.ResourceCmsRevision ||
  mongoose.model("ResourceCmsRevision", resourceCmsRevisionSchema);

export default ResourceCmsRevision;
