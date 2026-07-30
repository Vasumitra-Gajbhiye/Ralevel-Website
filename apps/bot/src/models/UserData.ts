import mongoose from "mongoose";

/** Slim UserData schema — same collection as the website, only fields the bot needs. */
const UserDataSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    nickname: { type: String, sparse: true, trim: true, lowercase: true },
    discordUserId: { type: String, trim: true },
  },
  { timestamps: true, strict: false },
);

export default mongoose.models.UserData ||
  mongoose.model("UserData", UserDataSchema);
