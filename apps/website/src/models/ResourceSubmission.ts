import mongoose from "mongoose";

/* ================================
   📁 Uploaded file (R2-backed)
================================ */
const UploadedFileSchema = new mongoose.Schema(
  {
    fieldId: {
      type: String,
      required: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      required: true,
    },

    /** 🔑 R2 storage key */
    r2Key: {
      type: String,
      required: true,
    },

    /** 🌍 Public URL (r2.dev or custom domain) */
    url: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

/* ================================
   📦 Individual Resource
================================ */
const ResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    resourceType: {
      type: String,
      enum: ["Files", "Links", "Files + Links"],
      required: true,
    },

    levels: [
      {
        type: String,
        enum: ["IGCSE", "AS", "A2"],
      },
    ],

    boards: [
      {
        type: String,
        enum: ["CAIE", "CBSE", "IB"],
      },
    ],

    madeByMe: {
      type: Boolean,
      default: false,
    },

    links: [
      {
        type: String,
      },
    ],

    files: [UploadedFileSchema],

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    adminNotes: {
      type: String,
    },
  },
  { _id: false }
);

/* ================================
   📄 Submission (root)
================================ */
const ResourceSubmissionSchema = new mongoose.Schema(
  {
    formSlug: {
      type: String,
      required: true,
      index: true,
      default: "resource",
    },

    contributorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contributor",
      required: true,
      index: true,
    },

    resources: {
      type: [ResourceSchema],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    adminNotes: {
      type: String,
    },

    metadata: {
      ip: String,
      userAgent: String,
    },

    certificateIssued: {
      type: Boolean,
      default: false,
    },

    certificateIssuedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ResourceSubmission ||
  mongoose.model("ResourceSubmission", ResourceSubmissionSchema);
