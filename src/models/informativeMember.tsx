import mongoose from "mongoose";

const informativeMemberSchema = new mongoose.Schema(
  {
    username: { type: String, default: "" },
    userId: { type: String, default: "" },
    email: { type: String, default: "" },

    positionStart: { type: Date },

    activity: {
      type: String,
      enum: ["no_concern", "raised_concern", "requires_notice", "not_required"],
      default: "no_concern",
    },
  },
  { timestamps: true }
);

export default mongoose.models.InformativeMember ||
  mongoose.model("InformativeMember", informativeMemberSchema);
