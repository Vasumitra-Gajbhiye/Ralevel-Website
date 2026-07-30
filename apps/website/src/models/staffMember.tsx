// models/staffMember.ts
import { Schema, model, models } from "mongoose";

const staffMemberSchema = new Schema(
  {
    username: String,
    realName: String,
    email: String,
    userId: String,

    rank: {
      type: String,
      enum: [
        "community_lead",
        "admin",
        "senior_mod",
        "junior_mod",
        "trial_mod",
        "former_staff",
        "mod_dep_head",
        "helper_dep_head",
        "graphic_dep_head",
        "info_dep_head",
      ],
      required: true,
    },

    activity: {
      type: String,
      enum: [
        "no_concern",
        "minor_concern",
        "raised_concern",
        "critical_concern",
        "requires_notice",
        "not_required",
      ],
      default: "not_required",
    },

    behaviour: {
      type: String,
      enum: [
        "no_record",
        "minor_record",
        "raised_record",
        "degraded_record",
        "disregarded",
      ],
      default: "no_record",
    },

    state: {
      type: String,
      enum: ["active", "loa", "discharged"],
      default: "active",
    },

    positionStart: Date,
    lastPromotion: Date,
    notes: String,
  },
  { timestamps: true }
);

export default models.StaffMember || model("StaffMember", staffMemberSchema);
