// import mongoose from "mongoose";

// const FormFieldSchema = new mongoose.Schema({
//   id: { type: String, required: true },
//   label: { type: String, required: true },
//   type: {
//     type: String,
//     enum: ["text", "textarea", "email", "select", "file", "url"],
//     required: true,
//   },
//   required: { type: Boolean, default: false },
//   options: [String], // for select
// });

// const FormSchema = new mongoose.Schema(
//   {
//     title: String,
//     slug: { type: String, unique: true },
//     description: String,
//     status: { type: String, enum: ["open", "closed"], default: "open" },
//     fields: [FormFieldSchema],
//   },
//   { timestamps: true }
// );

// export default mongoose.models.Form || mongoose.model("Form", FormSchema);

import mongoose from "mongoose";

const FormFieldSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },

    type: {
      type: String,
      enum: [
        "text",
        "textarea",
        "email",
        "select",
        "file",
        "url",
        "checkbox",
        "radio",
      ],
      required: true,
    },

    required: { type: Boolean, default: false },
    placeholder: String,

    // For select
    options: {
      type: [String],
      default: [],
    },

    // 🔥 NEW
    multiple: {
      type: Boolean,
      default: false,
    },

    minSelections: {
      type: Number,
    },

    maxSelections: {
      type: Number,
    },

    allowOther: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);
const FormSectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true }, // stable API key
    title: { type: String, required: true },
    subtitle: String,
    fields: [FormFieldSchema],
  },
  { _id: false }
);

const FormSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,

    status: {
      type: String,
      enum: ["open", "closed", "permanently-closed"],
      default: "open",
    },
    cycleId: {
      type: Number,
    },
    formType: {
      type: String,
    },
    ctaText: {
      type: String,
    },

    responseCount: {
      type: Number,
      default: 0,
    },

    banner: {
      type: {
        type: String,
        enum: ["gradient", "image"],
      },
      value: String,
    },

    introductionBlocks: Array, // keep flexible

    sections: [FormSectionSchema], // ✅ THIS IS KEY
  },
  { timestamps: true }
);

export default mongoose.models.Form || mongoose.model("Form", FormSchema);
