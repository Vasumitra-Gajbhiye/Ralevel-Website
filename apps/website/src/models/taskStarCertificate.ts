import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

/**
 * One certificate an admin issued for stars earned in a department. Each row
 * uses up STARS_PER_CERTIFICATE stars (see lib/tasks/stars.ts).
 */
const taskStarCertificateSchema = new mongoose.Schema(
  {
    userId: { type: ObjectId, ref: "UserData", required: true },
    departmentKey: { type: String, required: true },
    markedBy: { type: ObjectId, ref: "UserData", required: true },
    /** The CertData id from /admin/certificates, when the admin gives one. */
    certId: { type: String, default: null, trim: true, maxlength: 100 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

taskStarCertificateSchema.index({ departmentKey: 1, userId: 1 });

export default mongoose.models.TaskStarCertificate ||
  mongoose.model("TaskStarCertificate", taskStarCertificateSchema);
