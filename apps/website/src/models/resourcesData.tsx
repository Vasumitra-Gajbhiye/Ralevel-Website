import { Schema, model, models } from "mongoose";

const resourcesDataSchema = new Schema({
  title: String,
  emoji: String,
  links: [
    {
      link: String,
      linkTitle: String,
    },
  ],
  id: Number,
});

const ResourcesData =
  models.ResourcesData || model("ResourcesData", resourcesDataSchema);

export default ResourcesData;
