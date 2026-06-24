import mongoose from "mongoose";

const scheduleItemSchema = new mongoose.Schema(
  {
    event: { type: String, default: "" },

    date: { type: Date, default: null },

    ping: {
      type: String,
      enum: ["yes", "no"],
      default: "no",
    },

    development: {
      type: String,
      enum: ["awaiting", "in_development", "developed"],
      default: "awaiting",
    },

    sent: {
      type: String,
      enum: ["awaiting", "sent"],
      default: "awaiting",
    },

    serverEvent: {
      type: String,
      enum: ["required", "not_required"],
      default: "not_required",
    },

    status: {
      type: String,
      enum: ["dormant", "approaching", "ongoing", "concluded"],
      default: "dormant",
    },

    details: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.ScheduleItem ||
  mongoose.model("ScheduleItem", scheduleItemSchema);
