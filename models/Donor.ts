import mongoose, { Schema, models } from "mongoose";

const DonorSchema = new Schema(
  {
    userEmail: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    tierLabel: {
      type: String,
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    stripeSessionId: {
      type: String,
      required: true,
    },
    isClaimed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

export const Donor = models.Donor || mongoose.model("Donor", DonorSchema);
