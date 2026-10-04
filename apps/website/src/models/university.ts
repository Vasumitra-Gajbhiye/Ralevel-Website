import {
  AID_BASIS,
  AID_FORMS,
  AID_POLICIES,
  SCHOLARSHIP_SOURCES,
  SCHOLARSHIP_STATUSES,
  TEST_POLICIES,
} from "@/lib/scholarships/constants";
import mongoose from "mongoose";

const deadlineSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    date: { type: Date, required: true },
  },
  { _id: false },
);

const actorSchema = new mongoose.Schema(
  {
    userId: { type: String },
    email: { type: String },
  },
  { _id: false },
);

const universitySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    country: { type: String, required: true }, // ISO code
    city: { type: String, default: "" },
    logo: { type: String, default: "" },
    website: { type: String, default: "" },
    aidPageUrl: { type: String, default: "" },
    netPriceCalculatorUrl: { type: String, default: "" },

    aidPolicy: { type: String, enum: AID_POLICIES, required: true },
    aidTypes: { type: [String], enum: AID_BASIS, default: [] },
    noLoans: { type: Boolean, default: false },
    requiredForms: { type: [String], enum: AID_FORMS, default: [] },
    testPolicy: { type: String, enum: TEST_POLICIES, default: "not_applicable" },

    // From the Common Data Set, section H6 (aid to international students).
    stats: {
      intlStudentsAided: { type: Number },
      avgAidUsd: { type: Number },
      costOfAttendanceUsd: { type: Number },
      dataYear: { type: String, default: "" },
    },

    deadlines: { type: [deadlineSchema], default: [] },
    highlights: { type: [String], default: [] },
    description: { type: String, default: "" },

    status: {
      type: String,
      enum: SCHOLARSHIP_STATUSES,
      default: "draft",
      index: true,
    },
    needsVerification: { type: Boolean, default: false },
    lastVerifiedAt: { type: Date },
    source: { type: String, enum: SCHOLARSHIP_SOURCES, default: "admin" },

    createdBy: { type: actorSchema },
    updatedBy: { type: actorSchema },
  },
  { timestamps: true },
);

universitySchema.index({ name: "text", city: "text" }, { name: "university_text" });
universitySchema.index({ status: 1, country: 1 });
universitySchema.index({ status: 1, "stats.avgAidUsd": -1 });

export default mongoose.models.University ||
  mongoose.model("University", universitySchema);
