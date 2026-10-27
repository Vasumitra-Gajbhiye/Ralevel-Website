import mongoose from "mongoose";

const changeSchema = new mongoose.Schema(
  {
    section: { type: String, required: true },
    role: { type: String, required: true },
    granted: { type: Boolean, required: true },
  },
  { _id: false }
);

// One row per saved edit on /admin/permissions, for the History drawer.
const adminPageAccessChangeSchema = new mongoose.Schema(
  {
    actor: {
      userId: { type: String },
      email: { type: String },
      name: { type: String },
    },
    changes: { type: [changeSchema], default: [] },
    note: { type: String, maxlength: 500 },
    fromVersion: { type: Number, required: true },
    toVersion: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

adminPageAccessChangeSchema.index({ createdAt: -1 });
adminPageAccessChangeSchema.index({ "changes.role": 1, createdAt: -1 });
adminPageAccessChangeSchema.index({ "changes.section": 1, createdAt: -1 });

export default mongoose.models.AdminPageAccessChange ||
  mongoose.model("AdminPageAccessChange", adminPageAccessChangeSchema);
