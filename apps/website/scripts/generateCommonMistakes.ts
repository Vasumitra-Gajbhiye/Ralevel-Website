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

async function generateCommonMistakesScript(
  jsonPath: string,
  chapterId: string,
) {
  try {
    // -------------------------
    // Load JSON
    // -------------------------

    const absolutePath = path.resolve(jsonPath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${absolutePath}`);
    }

    const raw = fs.readFileSync(absolutePath, "utf-8");
    const data: LearningObjectivesFile = JSON.parse(raw);

    // -------------------------
    // Extract chapter
    // -------------------------

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

    console.log(
      `\nGenerating common mistakes for Chapter ${chapterId} - ${chapterTitle}`,
    );

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

Identify the MOST COMMON mistakes students make in this chapter.

OUTPUT FORMAT (STRICT JSON ARRAY):

[
  {
    "mistakeTitle": "Short mistake name",
    "explanation": "Clear explanation of the mistake and why it is wrong."
  }
]

RULES:
- Maximum 10 mistakes (do NOT exceed 10 or give unnecessary data)
- Don't submit irrlevant/low-value data just to fill the 10 mistakes quota
- Each mistakeTitle should be short (3–6 words)
- Explanations should be concise (1–2 lines)
- Focus on REAL exam mistakes (not generic advice)
- Avoid repetition
- Cover the entire chapter
- No markdown, no headings, no extra text
- Output ONLY valid JSON array

CHAPTER: ${chapterTitle}

LEARNING OBJECTIVES:
${formattedObjectives}`;

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: prompt,
      max_output_tokens: 1000,
      temperature: 0.3,
    });

    const text = response.output_text?.trim();

    let commonMistakes: any[] = [];

    try {
      const parsed = JSON.parse(text || "[]");
      commonMistakes = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to parse JSON", text);
    }

    // enforce max 10
    commonMistakes = commonMistakes.slice(0, 10);

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
          "chapters.$.commonMistakes": commonMistakes,
        },
      },
    );

    if (result.matchedCount === 0) {
      console.error("❌ No matching chapter found in DB");
    }

    console.log(`✅ Saved common mistakes for Chapter ${chapterId}`);
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
    "Usage: ts-node scripts/generateCommonMistakes.ts <path-to-json> <chapterId>",
  );
  process.exit(1);
}

const jsonPath = args[0];
const chapterId = args[1];

// Run
generateCommonMistakesScript(jsonPath, chapterId);
