import "dotenv/config";

import { resolveScriptMongoUri } from "../../../scripts/db/guard";
import Subject from "@/models/subjectGuide";
function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/^\d+\.\s*/, "")
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

async function run() {
  await resolveScriptMongoUri(); // local dev DB only, unless --prod
  // Imported after the guard: lib/mongodb reads MONGODB_URI at import time.
  const { default: connectDB } = await import("@/lib/mongodb");
  await connectDB();

  const subjects = await Subject.find();

  for (const subject of subjects) {
    subject.chapters = subject.chapters.map((chapter: any) => ({
      ...chapter.toObject(),
      slug: slugify(chapter.title),
      topics: chapter.topics?.map((topic: any) => ({
        ...topic,
        slug: slugify(topic.title),
      })),
    }));

    await subject.save();
  }

  console.log("Slugs added ✅");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
