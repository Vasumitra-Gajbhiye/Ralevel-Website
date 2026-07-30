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

async function generateKeyConceptsScript(jsonPath: string, chapterId: string) {
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
      `\nGenerating key concepts for Chapter ${chapterId} - ${chapterTitle}`,
    );

    // -------------------------
    // Generate key concepts (aggregate from all topics)
    // -------------------------

    const allLearningObjectives: string[] = [];

    for (const topic of chapter.topics) {
      allLearningObjectives.push(...topic.learningObjectives);
    }

    const formattedObjectives = allLearningObjectives
      .map((obj) => `- ${obj}`)
      .join("\n");

    const prompt = `You are an expert Cambridge A-Level teacher.

Your task is to extract the MOST IMPORTANT key concepts from a chapter based on its learning objectives.

INPUT:
- A list of learning objectives covering the entire chapter.

OUTPUT REQUIREMENTS:

Return a JSON array called "keyConcepts".

Each item must have:
- "title": short (1–4 words), precise concept name
- "description": very concise explanation (1–2 lines max)

RULES:

1. Maximum 10 key concepts total.
2. Do NOT exceed 10 under any circumstance.
3. Avoid repetition or overlap between concepts.
4. Titles must be clean and academic (e.g., "Velocity", "Acceleration", "Newton's Second Law").
5. Descriptions must be SHORT — this is an overview, not detailed notes.
6. Cover the ENTIRE chapter, not individual topics separately.
7. Merge related ideas into a single concept where appropriate.
8. Do NOT include examples, derivations, or long explanations.
9. Do NOT include markdown, headings, or extra text.
10. Output ONLY valid JSON.

FORMAT:

{
  "keyConcepts": [
    {
      "title": "Concept Name",
      "description": "Short explanation."
    }
  ]
}

INPUT LEARNING OBJECTIVES:
{{LEARNING_OBJECTIVES}}`;

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: prompt.replace("{{LEARNING_OBJECTIVES}}", formattedObjectives),
      max_output_tokens: 1000,
      temperature: 0.3,
    });

    const text = response.output_text?.trim();

    let keyConcepts: any[] = [];

    try {
      const parsed = JSON.parse(text || "{}");
      keyConcepts = parsed.keyConcepts || [];
    } catch (e) {
      console.error("Failed to parse JSON", text);
    }

    // -------------------------
    // Save to MongoDB
    // -------------------------

    await Subject.updateOne(
      {
        examCode: data.code,
        "chapters.slug": chapterSlug,
      },
      {
        $set: {
          "chapters.$.keyConcepts": keyConcepts,
        },
      },
    );

    console.log(`✅ Saved key concepts for Chapter ${chapterId}`);
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
    "Usage: ts-node scripts/generateKeyConcepts.ts <path-to-json> <chapterId>",
  );
  process.exit(1);
}

const jsonPath = args[0];
const chapterId = args[1];

// Run
generateKeyConceptsScript(jsonPath, chapterId);
