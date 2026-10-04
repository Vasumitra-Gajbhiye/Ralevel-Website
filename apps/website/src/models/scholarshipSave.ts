import { TRACKER_STATUSES } from "@/lib/scholarships/constants";
import mongoose from "mongoose";

const scholarshipSaveSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
    },
    scholarshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scholarship",
      required: true,
    },
    status: { type: String, enum: TRACKER_STATUSES, default: "saved" },
    // _ids of Scholarship.requirements the student has ticked off
    completedRequirementIds: { type: [String], default: [] },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

scholarshipSaveSchema.index({ userId: 1, scholarshipId: 1 }, { unique: true });

export default mongoose.models.ScholarshipSave ||
  mongoose.model("ScholarshipSave", scholarshipSaveSchema);
