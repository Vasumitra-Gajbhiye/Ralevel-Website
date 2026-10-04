import { ROLES } from "@/lib/roles";
import mongoose from "mongoose";

const userDataSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },

    boards: { type: [String], default: [] },
    // models/userData.ts

    roles: {
      type: [String],
      enum: ROLES,
      default: [],
    },
    subjectsAS: { type: [String], default: [] },
    subjectsA2: { type: [String], default: [] },

    redditUsername: { type: String, default: "" },
    discordUsername: { type: String, default: "" },
    nickname: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    discordUserId: { type: String, trim: true },

    examSession: { type: [String], default: [] },

    // Study plans (scholarship matching). ISO country codes / field keys.
    nationalities: { type: [String], default: [] },
    studyDestinations: { type: [String], default: [] },
    intendedFields: { type: [String], default: [] },

    receiveEmails: { type: Boolean, default: false },

    writerProfile: {
      bio: { type: String, default: "" },
      avatar: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

userDataSchema.index({ roles: 1 });

export default mongoose.models.UserData ||
  mongoose.model("UserData", userDataSchema);
