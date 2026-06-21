import { Schema, model, models } from "mongoose";

// const blogsDataSchema = new Schema({
//   mainTitle: String,
//   description: String,
//   date: String,
//   timeToRead: String,
//   tag: String,
//   author: String,
//   introSection: {
//     imageSrc: String,
//     imageAlt: String,
//     paragraphs: [],
//   },
//   sections: [
//     {
//       title: String,
//       imgSrc: String,
//       imageAlt: String,
//       paragraphs: Array,
//     },
//   ],
// });

const blogsDataSchema = new Schema(
  {
    mainTitle: String,
    description: String,
    date: String,
    timeToRead: String,
    tag: String,
    author: String,
    slug: String,
  },
  { timestamps: true }
);

blogsDataSchema.index({ slug: 1 }, { unique: true });

const BlogsData = models.BlogsData || model("BlogsData", blogsDataSchema);

export default BlogsData;
