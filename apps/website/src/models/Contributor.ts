import mongoose from "mongoose";

const ContributorSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    discordOrRedditId: {
      type: String,
      required: true,
      index: true,
    },

    totalSubmissions: {
      type: Number,
      default: 0,
    },

    totalApprovedResources: {
      type: Number,
      default: 0,
    },

    certificateIssued: {
      type: Boolean,
      default: false,
    },

    certificateIssuedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Contributor ||
  mongoose.model("Contributor", ContributorSchema);
