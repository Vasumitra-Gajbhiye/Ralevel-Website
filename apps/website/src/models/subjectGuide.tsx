// import mongoose, { Schema, model, models } from "mongoose";

// const subtopicSchema = new mongoose.Schema({
//   name: String,
//   url: String,
// });

// const chapterSchema = new mongoose.Schema({
//   name: String,
//   subtopics: [subtopicSchema],
// });

// const subjectGuideSchema = new mongoose.Schema({
//   subjectName: { type: String, required: true },
//   examCode: { type: String, required: true },
//   chapters: [chapterSchema],
// });

// export default mongoose.models.SubjectGuide || mongoose.model("SubjectGuide", subjectGuideSchema);

// export interface SubjectGuideType {
//   subjectName: string;
//   examCode?: string;
//   topics: {
//     title: string;
//     subtopics: string[];
//   }[];
// }

// const subjectGuideSchema = new Schema<SubjectGuideType>({
//   subjectName: String,
//   examCode: String,
//   topics: [
//     {
//       title: String,
//       subtopics: [String],
//     },
//   ],
// });

// export default models.SubjectGuide ||
//   model<SubjectGuideType>("SubjectGuide", subjectGuideSchema);

// ✅ Safe initialization
// const SubjectGuide =
//   (mongoose.models && mongoose.models.SubjectGuide) ||
//   mongoose.model("SubjectGuide", subjectGuideSchema);

// export default SubjectGuide;

// import { Schema, model, models } from "mongoose";

// export interface SubjectGuideType {
//   subjectName: string;
//   examCode?: string;
//   chapters: {
//     title: string;
//     topics: {
//       title: string;
//       subtopics: string[];
//     }[];
//   }[];
// }

// const subjectGuideSchema = new Schema<SubjectGuideType>({
//   subjectName: { type: String, required: true },
//   examCode: String,
//   chapters: [
//     {
//       title: String,
//       slug: String,
//       keyConcepts: [
//         {
//           title: String,
//           description: String,
//         },
//       ],
//       topics: [
//         {
//           title: String,
//           subtopics: [String],
//         },
//       ],
//     },
//   ],
// });

// export default models.SubjectGuide ||
//   model<SubjectGuideType>("SubjectGuide", subjectGuideSchema);

import { Schema, model, models } from "mongoose";

export interface SubjectGuideType {
  subjectName: string;
  examCode?: string;
  chapters: {
    title: string;
    slug: { type: String; required: true };
    keyConcepts?: {
      title: string;
      description: string;
    }[];
    topics: {
      title: string;
      subtopics: string[];
    }[];
  }[];

  board: string;
  // level: string;
}

const subjectGuideSchema = new Schema<SubjectGuideType>({
  subjectName: { type: String, required: true },
  examCode: String,
  chapters: [
    {
      title: String,
      slug: String,
      introduction: String,
      examinerTips: [String],
      chapterSummary: String,
      keyConcepts: [
        {
          title: String,
          description: String,
        },
      ],
      commonMistakes: [
        {
          mistakeTitle: String,
          explanation: String,
        },
      ],
      topics: [
        {
          title: String,
          slug: String,
          subtopics: [String],
        },
      ],
    },
  ],
  board: { type: String, required: true },
  // level: { type: String, required: true },
});
subjectGuideSchema.index({ examCode: 1, "chapters.slug": 1 });
export default models.SubjectGuide ||
  model<SubjectGuideType>("SubjectGuide", subjectGuideSchema);
