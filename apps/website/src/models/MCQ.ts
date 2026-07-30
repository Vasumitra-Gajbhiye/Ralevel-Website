import mongoose from "mongoose";

const MCQSchema = new mongoose.Schema(
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

    chapterSlug: {
      type: String,
      required: true,
      index: true,
    },

    topicSlug: {
      type: String,
      required: true,
      index: true,
    },

    topicId: {
      type: String,
      required: true,
      index: true,
    },

    // theory or calculation
    type: {
      type: String,
      enum: ["theory", "calculation"],
      required: true,
      index: true,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
      index: true,
    },

    // Question content
    stem: {
      type: String,
      required: true,
    },

    options: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length === 4,
        message: "MCQ must have exactly 4 options",
      },
    },

    answer: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },

    explain: {
      type: String,
      required: true,
    },

    // LaTeX detection (optional optimization)
    hasMath: {
      type: Boolean,
      default: false,
    },

    // For diagram questions later
    imageUrl: {
      type: String,
      default: null,
    },

    // Source tracking (important for AI generation)
    source: {
      type: String,
      enum: ["ai", "manual"],
      default: "ai",
      index: true,
    },

    // Generation batch tracking
    generationBatch: {
      type: String,
      default: null,
      index: true,
    },

    // Control publishing
    published: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Important compound indexes
MCQSchema.index({
  board: 1,
  level: 1,
  subject: 1,
  code: 1,
  topicSlug: 1,
  type: 1,
});

MCQSchema.index({
  chapterSlug: 1,
  topicSlug: 1,
  difficulty: 1,
});

export default mongoose.models.MCQ || mongoose.model("MCQ", MCQSchema);
