// models/FormSubmission.ts
import mongoose from "mongoose";

const VoteSchema = new mongoose.Schema(
  {
    adminId: {
      type: String,
      required: true,
    },
    adminName: {
      type: String,
      required: true,
    },
    vote: {
      type: Number,
      enum: [1, -1], // 1 = upvote, -1 = downvote
      required: true,
    },
    votedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const CommentSchema = new mongoose.Schema(
  {
    adminId: {
      type: String,
      required: true,
    },
    adminName: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const FileSchema = new mongoose.Schema(
  {
    fieldId: {
      type: String,
      required: true,
      index: true,
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
    },
    key: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const FormSubmissionSchema = new mongoose.Schema(
  {
    formSlug: {
      type: String,
      required: true,
      index: true,
    },

    responses: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    cycleId: {
      type: Number,
      required: true,
      index: true,
    },

    formType: {
      type: String,
      required: true,
      index: true,
    },
    metadata: {
      ip: String,
      userAgent: String,
    },
    votes: {
      type: [VoteSchema],
      default: [],
    },

    comments: {
      type: [CommentSchema],
      default: [],
    },
    files: {
      type: [FileSchema],
      default: [],
    },
    submitterName: {
      type: String,
      index: true,
    },

    submitterEmail: {
      type: String,
      index: true,
    },

    reminderPings: {
      day3: { type: Date },
      day5: { type: Date },
      day7: { type: Date },
    },
  },
  { timestamps: true }
);
FormSubmissionSchema.index(
  { formType: 1, cycleId: 1, submitterEmail: 1 },
  {
    unique: true,
    partialFilterExpression: {
      submitterEmail: { $exists: true, $type: "string" },
    },
  }
);
FormSubmissionSchema.index({ formSlug: 1, createdAt: -1 });
export default mongoose.models.FormSubmission ||
  mongoose.model("FormSubmission", FormSubmissionSchema);
