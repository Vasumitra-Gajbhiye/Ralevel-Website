import mongoose from "mongoose";

// Single document (key "default") holding admin page-access overrides:
// { [sectionKey]: Role[] } for sections that differ from the code defaults in
// lib/admin-access/sections.ts. Missing document or key = default access.
const adminPageAccessSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    sections: { type: mongoose.Schema.Types.Mixed, default: {} },
    // Bumped on every save; writes must name the version they started from.
    version: { type: Number, default: 0 },
    updatedBy: {
      userId: { type: String },
      email: { type: String },
      name: { type: String },
    },
  },
  { timestamps: true, minimize: false }
);

export default mongoose.models.AdminPageAccess ||
  mongoose.model("AdminPageAccess", adminPageAccessSchema);
