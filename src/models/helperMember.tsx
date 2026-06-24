import mongoose, { Schema, models } from "mongoose";

const helperMemberSchema = new Schema(
  {
    username: { type: String, default: "" },
    userId: { type: String, default: "" },

    email: { type: String, default: "" },

    rank: {
      type: String,
      enum: ["junior_helper", "senior_helper"],
      default: "junior_helper",
    },

    activity: {
      type: String,
      enum: ["no_concern", "raised_concern", "requires_notice", "not_required"],
      default: "not_required",
    },

    promotedAt: {
      type: Date,
      default: null, // only for senior helpers
    },
  },
  { timestamps: true }
);

export default models.HelperMember ||
  mongoose.model("HelperMember", helperMemberSchema);
