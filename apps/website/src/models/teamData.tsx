import { Schema, model, models } from "mongoose";

const teamDataSchema = new Schema(
  {
    name: String,
    title: String,
    discordId: String,
    linkedin: String,
    imgSrc: String,
    sortOrder: { type: Number, default: 0 },
    showOnHomepage: { type: Boolean, default: false },
  },
  { timestamps: true },
);

if (models.TeamData) {
  delete models.TeamData;
}

const TeamData = model("TeamData", teamDataSchema);

export default TeamData;
