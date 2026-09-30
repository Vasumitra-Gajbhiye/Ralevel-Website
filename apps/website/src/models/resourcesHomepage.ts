import mongoose from "mongoose";

const featuredCardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    href: { type: String, required: true },
    description: { type: String },
    image: { type: String }, // cloudinary path, e.g. "/featured_thumb/homepage-ab12cd34.png"
    badge: { type: String }, // e.g. "New"
  },
  { _id: false }
);

// Single document (key "default") holding the /resources page sections.
const resourcesHomepageSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    featured: { type: [featuredCardSchema], default: [] },
    popularSlugs: { type: [String], default: [] },
    updatedBy: {
      userId: { type: String },
      email: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.models.ResourcesHomepage ||
  mongoose.model("ResourcesHomepage", resourcesHomepageSchema);
