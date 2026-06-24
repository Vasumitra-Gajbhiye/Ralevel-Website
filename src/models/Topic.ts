import mongoose from "mongoose";

const TopicSchema = new mongoose.Schema(
  {
    board: {
      type: String,
      required: true,
      index: true,
    },

    level: {
      type: String,
      required: true,
      index: true,
    },

    subject: {
      type: String,
      required: true,
      index: true,
    },

    code: {
      type: String,
      required: true,
      index: true,
    },

    chapter: {
      type: String,
      required: true,
      index: true,
    },

    chapterSlug: {
      type: String,
      index: true,
    },

    chapterTitle: {
      type: String,
      required: true,
    },

    topicId: {
      type: String,
      required: true,
      index: true,
    },

    slug: {
      type: String,
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
    },

    introMarkdown: {
      type: String,
      default: "",
    },

    detailedNotesMarkdown: {
      type: String,
      default: "",
    },

    quickRevisionMarkdown: {
      type: String,
      default: "",
    },

    metaDescription: {
      type: String,
      default: "",
    },

    published: {
      type: Boolean,
      default: true,
      index: true,
    },
    // Example of how your Topic schema should look now:
    flashcards: {
      description: { type: String },
      numberOfCards: { type: Number },
      difficulty: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
      },
      cards: [
        {
          id: { type: String, required: true },
          question: { type: String, required: true },
          answer: { type: String, required: true },
          hint: { type: String },
          tags: [{ type: String }],
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

TopicSchema.index(
  { board: 1, level: 1, subject: 1, code: 1, topicId: 1 },
  { unique: true }
);

export default mongoose.models.Topic || mongoose.model("Topic", TopicSchema);
