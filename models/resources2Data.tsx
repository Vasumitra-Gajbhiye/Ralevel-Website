import mongoose from "mongoose";

const syllabusSchema = new mongoose.Schema({
  title: { type: String, required: true },
  board: { type: String, required: true },
  link: { type: String, required: true },
});

const notesSchema = new mongoose.Schema({
  title: { type: String, required: true },
  source: { type: String },
  link: { type: String, required: true },
  tags: [{ type: String }],
});

const booksSchema = new mongoose.Schema({
  title: { type: String, required: true },
  edition: { type: String },
  cover: { type: String },
  buy: { type: String },
});

const youtubeChannelSchema = new mongoose.Schema({
  channel: { type: String, required: true },
  channelUrl: { type: String, required: true },
  description: { type: String },
  thumbnail: { type: String },
  type: { type: String },
});

const youtubePlaylistSchema = new mongoose.Schema({
  title: { type: String, required: true },
  playlistUrl: { type: String, required: true },
  description: { type: String },
  thumbnail: { type: String },
});

const pastPaperSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  board: { type: String, required: true },
  link: { type: String, required: true },
});

const toolsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String },
});

const themeSchema = new mongoose.Schema({
  primary: { type: String, required: true },
  primaryDark: { type: String, required: true },
  primaryAccent: { type: String, required: true },
  primaryLight: { type: String, required: true },
  primaryText: { type: String, required: true },
  primaryTextStrong: { type: String, required: true },

  borderLight: { type: String, required: true },
  borderLighter: { type: String, required: true },
  borderLightest: { type: String, required: true },

  gradientStart: { type: String, required: true },
  gradientMid: { type: String, required: true },
  gradientEnd: { type: String, required: true },
});

const worksheetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  link: { type: String, required: true },

  // Optional metadata
  board: { type: String }, // e.g., "CAIE", "Edexcel"
  topic: { type: String }, // e.g., "Organic Chemistry"
  difficulty: { type: String }, // e.g., "Easy", "Medium", "Hard"
  yearRange: { type: String }, // e.g., "2016–2023"
});

const pdfBookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  link: { type: String, required: true }, // direct PDF link

  // Optional branding
  cover: { type: String }, // image url for thumbnail
  source: { type: String }, // e.g., "OpenStax", "Author Release"
});

const resources2dataSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true }, // e.g. "Chemistry"
    slug: { type: String, required: true }, // e.g. "Chemistry"
    level: { type: String, default: "A-Level" }, // optional field
    syllabus: [syllabusSchema],
    notes: [notesSchema],
    pdfBooks: [pdfBookSchema],
    books: [booksSchema],
    youtubeChannel: [youtubeChannelSchema],
    youtubePlaylist: [youtubePlaylistSchema],
    worksheets: [worksheetSchema],
    pastPapers: [pastPaperSchema],
    tools: [toolsSchema],
    theme: themeSchema,
  },
  { timestamps: true }
);

resources2dataSchema.index({ slug: 1 }, { unique: true });

export default mongoose.models.resources2data ||
  mongoose.model("resources2data", resources2dataSchema);
