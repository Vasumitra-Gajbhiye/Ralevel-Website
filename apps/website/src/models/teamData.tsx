import { Schema, model, models } from "mongoose";

const teamDataSchema = new Schema({
  name: String,
  title: String,
  discordId: String,
  linkedin: String,
  imgSrc: String,
});

const TeamData = models.TeamData || model("TeamData", teamDataSchema);

export default TeamData;
