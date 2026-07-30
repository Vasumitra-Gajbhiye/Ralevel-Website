import mongoose from "mongoose";

const GlossarySchema = new mongoose.Schema(
  {
    term: {
      type: String,
      required: true,
      index: true,
    },

    slug: {
      type: String,
      required: true,
      index: true,
    },

    definition: {
      type: String,
      required: true,
    },

    board: {
      type: String,
      index: true,
    },

    level: {
      type: String,
      index: true,
    },

    subject: {
      type: String,
      index: true,
    },

    code: {
      type: String,
      index: true,
    },

    chapters: [
      {
        type: String,
      },
    ],

    topics: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

GlossarySchema.index(
  { term: 1, board: 1, level: 1, subject: 1, code: 1 },
  { unique: true }
);

export default mongoose.models.Glossary ||
  mongoose.model("Glossary", GlossarySchema);
