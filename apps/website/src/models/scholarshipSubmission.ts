import mongoose from "mongoose";

const scholarshipSubmissionSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ["new", "correction"], required: true },
    scholarshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scholarship",
    },
    title: { type: String, required: true, trim: true },
    url: { type: String, default: "" },
    deadline: { type: String, default: "" },
    notes: { type: String, default: "" },
    submittedBy: {
      userId: { type: String, required: true },
      email: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    adminNotes: { type: String, default: "" },
    createdScholarshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scholarship",
    },
  },
  { timestamps: true },
);

export default mongoose.models.ScholarshipSubmission ||
  mongoose.model("ScholarshipSubmission", scholarshipSubmissionSchema);
