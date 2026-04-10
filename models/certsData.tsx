import { Schema, model, models } from "mongoose";

const certDataSchema = new Schema(
  {
    name: String,
    certType: String,
    certId: {
      type: String,
      unique: true,
    },
    issueDate: { type: Date },
    admin: String,
    owner: String,
    email: String,
    discordUserId: String,
    certificateDesigned: Boolean,
    applicationID: String,
    certificateDelivered: Boolean,
    dateGiven: String,
    handler: String,
    hasCustomMessage: Boolean,
    customMessage: String,
    revoked: Boolean,
  },
  { timestamps: true }
);

const CertData = models.CertData || model("CertData", certDataSchema);

export default CertData;
