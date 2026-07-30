import mongoose from "mongoose";

const FormSubmissionSchema = new mongoose.Schema(
  {
    formSlug: { type: String, required: true, index: true },
    submittedAt: { type: Date, default: Date.now, index: true },
    formType: { type: String, required: true },
    votes: {
      type: [
        {
          adminId: String,
          adminName: String,
          vote: Number,
          votedAt: Date,
        },
      ],
      default: [],
    },
    submitterName: { type: String },
    submitterEmail: { type: String },
    reminderPings: {
      day3: { type: Date },
      day5: { type: Date },
      day7: { type: Date },
    },
  },
  { timestamps: true, strict: false },
);

export default mongoose.models.FormSubmission ||
  mongoose.model("FormSubmission", FormSubmissionSchema);
