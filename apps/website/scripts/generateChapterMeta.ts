import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";
import OpenAI from "openai";
import path from "path";
import Subject from "../src/models/subjectGuide";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set in environment");
  await mongoose.connect(uri);
}

// -------------------------
// Types
// -------------------------

type Topic = {
  id: string;
  title: string;
  learningObjectives: string[];
};

type Section = {
  id: string;
  title: string;
  topics: Topic[];
};

type LearningObjectivesFile = {
  board: string;
  level: string;
  subject: string;
  code: string;
  sections: Section[];
};

// -------------------------
// Main function
// -------------------------

async function generateChapterMetaScript(jsonPath: string, chapterId: string) {
  try {
    const absolutePath = path.resolve(jsonPath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${absolutePath}`);
    }

    const raw = fs.readFileSync(absolutePath, "utf-8");
    const data: LearningObjectivesFile = JSON.parse(raw);

    const chapter = data.sections.find((s) => s.id === chapterId);

    if (!chapter) {
      throw new Error(`Chapter with id ${chapterId} not found.`);
    }

    const chapterTitle = chapter.title;

    const chapterSlug = chapterTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    await connectDB();

    console.log(`\nGenerating meta for Chapter ${chapterId} - ${chapterTitle}`);

    // -------------------------
    // Aggregate learning objectives
    // -------------------------

    const allLearningObjectives: string[] = [];

    for (const topic of chapter.topics) {
      allLearningObjectives.push(...topic.learningObjectives);
    }

    const formattedObjectives = allLearningObjectives
      .map((obj) => `- ${obj}`)
      .join("\n");

    // -------------------------
    // Prompt
    // -------------------------

    const prompt = `You are an expert Cambridge A-Level teacher.

Write concise high-level content for a chapter.

OUTPUT JSON FORMAT:

{
  "introduction": "1 short paragraph",
  "examinerTips": ["tip1", "tip2", "tip3"],
  "chapterSummary": "1 short paragraph"
}

RULES:
- Introduction: very short (2–4 sentences)
- Chapter summary: short (2–4 sentences)
- Examiner tips: 3–5 concise bullet-style tips
- No markdown, no headings, no extra text
- Output ONLY valid JSON

CHAPTER: ${chapterTitle}

LEARNING OBJECTIVES:
${formattedObjectives}`;

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: prompt,
      max_output_tokens: 800,
      temperature: 0.3,
    });

    const text = response.output_text?.trim();

    let introduction = "";
    let examinerTips: string[] = [];
    let chapterSummary = "";

    try {
      const parsed = JSON.parse(text || "{}");
      introduction = parsed.introduction || "";
      examinerTips = Array.isArray(parsed.examinerTips)
        ? parsed.examinerTips
        : [];
      chapterSummary = parsed.chapterSummary.trim() || "";
    } catch (e) {
      console.error("Failed to parse JSON", text);
    }

    // -------------------------
    // Save to MongoDB
    // -------------------------

    const result = await Subject.updateOne(
      {
        examCode: data.code,
        "chapters.slug": chapterSlug,
      },
      {
        $set: {
          "chapters.$.introduction": introduction,
          "chapters.$.examinerTips": examinerTips,
          "chapters.$.chapterSummary": chapterSummary,
        },
      },
    );
    if (result.matchedCount === 0) {
      console.error("❌ No matching chapter found in DB");
    }
    console.log(`✅ Saved chapter meta for Chapter ${chapterId}`);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

// -------------------------
// CLI Arguments
// -------------------------

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error(
    "Usage: ts-node scripts/generateChapterMeta.ts <path-to-json> <chapterId>",
  );
  process.exit(1);
}

const jsonPath = args[0];
const chapterId = args[1];

// Run
generateChapterMetaScript(jsonPath, chapterId);
