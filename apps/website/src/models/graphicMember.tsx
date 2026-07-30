import mongoose from "mongoose";

const graphicMemberSchema = new mongoose.Schema(
  {
    userId: { type: String, default: "" },
    username: { type: String, default: "" },
    email: { type: String, default: "" },

    positionStart: { type: Date },

    activity: {
      type: String,
      enum: ["no_concern", "raised_concern", "requires_notice", "not_required"],
      default: "no_concern",
    },

    resourceSubmissions: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.GraphicMember ||
  mongoose.model("GraphicMember", graphicMemberSchema);
