import {
  AID_BASIS,
  COVERS,
  FIELDS_OF_STUDY,
  FUNDING_TYPES,
  NATIONALITY_MODES,
  PROVIDER_TYPES,
  REQUIREMENT_TAGS,
  SCHOLARSHIP_SOURCES,
  SCHOLARSHIP_STATUSES,
  STUDY_LEVELS,
} from "@/lib/scholarships/constants";
import mongoose from "mongoose";

const requirementSchema = new mongoose.Schema({
  label: { type: String, required: true },
  detail: { type: String, default: "" },
});

const applyStepSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    detail: { type: String, default: "" },
  },
  { _id: false },
);

const linkSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    url: { type: String, required: true },
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

const scholarshipSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    provider: { type: String, required: true, trim: true },
    providerType: { type: String, enum: PROVIDER_TYPES, default: "other" },
    logo: { type: String, default: "" },
    summary: { type: String, default: "" },
    description: { type: String, default: "" },

    fundingType: { type: String, enum: FUNDING_TYPES, required: true },
    amountText: { type: String, default: "" },
    usdPerYearApprox: { type: Number },
    covers: { type: [String], enum: COVERS, default: [] },
    renewable: { type: Boolean, default: false },
    durationYears: { type: Number },

    studyLevels: { type: [String], enum: STUDY_LEVELS, default: [] },
    // ISO country codes, or "ANY"
    destinations: { type: [String], default: [] },

    nationality: {
      mode: { type: String, enum: NATIONALITY_MODES, default: "any" },
      countries: { type: [String], default: [] },
      note: { type: String, default: "" },
    },
    fieldsOfStudy: { type: [String], enum: FIELDS_OF_STUDY, default: [] },
    basis: { type: [String], enum: AID_BASIS, default: [] },
    minGrades: { type: String, default: "" },
    otherCriteria: { type: [String], default: [] },
    selectionCriteria: { type: [String], default: [] },

    requirements: { type: [requirementSchema], default: [] },
    requirementTags: { type: [String], enum: REQUIREMENT_TAGS, default: [] },
    applySteps: { type: [applyStepSchema], default: [] },

    opensAt: { type: Date },
    deadline: { type: Date },
    deadlineNote: { type: String, default: "" },
    resultsAt: { type: Date },
    rolling: { type: Boolean, default: false },
    recurring: { type: Boolean, default: false },

    applyUrl: { type: String, default: "" },
    officialUrl: { type: String, default: "" },
    extraLinks: { type: [linkSchema], default: [] },
    universities: [{ type: mongoose.Schema.Types.ObjectId, ref: "University" }],

    tags: { type: [String], default: [] },
    status: {
      type: String,
      enum: SCHOLARSHIP_STATUSES,
      default: "draft",
      index: true,
    },
    needsVerification: { type: Boolean, default: false },
    lastVerifiedAt: { type: Date },
    source: { type: String, enum: SCHOLARSHIP_SOURCES, default: "admin" },
    saveCount: { type: Number, default: 0 },

    createdBy: { type: actorSchema },
    updatedBy: { type: actorSchema },
  },
  { timestamps: true },
);

scholarshipSchema.index(
  { title: "text", provider: "text", summary: "text", tags: "text" },
  { weights: { title: 5, provider: 3, tags: 2, summary: 1 }, name: "scholarship_text" },
);
scholarshipSchema.index({ status: 1, deadline: 1 });
scholarshipSchema.index({ status: 1, destinations: 1 });
scholarshipSchema.index({ status: 1, studyLevels: 1 });
scholarshipSchema.index({ universities: 1 });

export default mongoose.models.Scholarship ||
  mongoose.model("Scholarship", scholarshipSchema);
