import { calculationMcqPrompt, theoryMcqPrompt } from "@/lib/prompts";
import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";
import OpenAI from "openai";
import path from "path";
import MCQModel from "../src/models/MCQ";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI not set in environment");
  }

  await mongoose.connect(uri);
}

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

async function generateMCQs(
  jsonPath: string,
  chapterId: string,
  type: "theory" | "calculation",
  numQuestionsPerTopic: number,
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
      throw new Error(`Chapter ${chapterId} not found`);
    }

    // -------------------------
    // Metadata
    // -------------------------

    const board = data.board;
    const level = data.level;
    const subject = data.subject;
    const code = data.code;

    const chapterTitle = chapter.title;

    const chapterSlug = chapterTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    await connectDB();

    const generationBatch = `${code}-${chapterSlug}-${type}-${Date.now()}`;

    console.log(`\nGeneration batch: ${generationBatch}`);

    // -------------------------
    // Loop topics
    // -------------------------

    for (const topic of chapter.topics) {
      console.log(
        `\nGenerating ${type} MCQs for topic ${topic.id} - ${topic.title}`,
      );

      const topicSlug = topic.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const formattedObjectives = topic.learningObjectives
        .map((o) => `- ${o}`)
        .join("\n");

      let prompt;

      if (type === "theory") {
        prompt = theoryMcqPrompt({
          board,
          level,
          subject,
          code,
          chapterId,
          chapterTitle,
          topic,
          formattedObjectives,
          numQuestionsPerTopic,
        });
      } else {
        prompt = calculationMcqPrompt({
          board,
          level,
          subject,
          code,
          chapterId,
          chapterTitle,
          topic,
          formattedObjectives,
          numQuestionsPerTopic,
        });
      }

      // -------------------------
      // OpenAI Request
      // -------------------------

      const response = await client.responses.create({
        model: "gpt-4.1",
        input: prompt,
        temperature: 0.4,

        text: {
          format: {
            type: "json_schema",
            name: "mcq_questions",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                questions: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      stem: { type: "string" },
                      options: {
                        type: "array",
                        items: { type: "string" },
                        minItems: 4,
                        maxItems: 4,
                      },
                      answer: { type: "number" },
                      explain: { type: "string" },
                      difficulty: {
                        type: "string",
                        enum: ["easy", "medium", "hard"],
                      },
                    },
                    required: [
                      "stem",
                      "options",
                      "answer",
                      "explain",
                      "difficulty",
                    ],
                  },
                },
              },
              required: ["questions"],
            },
          },
        },
      });

      // -------------------------
      // Extract JSON
      // -------------------------

      let parsed: any;

      try {
        const text = response.output_text;

        if (!text) {
          console.error("No text returned from model");
          console.log(response);
          continue;
        }

        parsed = JSON.parse(text);
      } catch (err) {
        console.error("Failed to parse JSON response");
        // console.log(response.output?.[0]?.content?.[0]);
        continue;
      }

      const questions = parsed.questions || [];

      console.log(`Received ${questions.length} questions`);

      // -------------------------
      // Save questions
      // -------------------------

      for (const q of questions) {
        if (!q.stem || !q.options || q.options.length !== 4) {
          console.warn("Skipping malformed question");
          continue;
        }

        if (q.answer < 0 || q.answer > 3) {
          console.warn("Invalid answer index");
          continue;
        }

        const hasMath =
          q.stem.includes("$") ||
          q.explain.includes("$") ||
          q.options.some((o: string) => o.includes("$"));

        await MCQModel.create({
          board,
          level,
          subject,
          code,

          chapterSlug,
          topicSlug,
          topicId: topic.id,

          type,
          difficulty: q.difficulty || "medium",

          stem: q.stem,
          options: q.options,
          answer: q.answer,
          explain: q.explain,

          hasMath,

          source: "ai",
          generationBatch,
        });
      }

      console.log(`Saved questions for topic ${topic.id}`);
    }

    console.log(`\nFinished generating ${type} MCQs for Chapter ${chapterId}`);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
  }
}

// -------------------------
// CLI arguments
// -------------------------

const args = process.argv.slice(2);

if (args.length < 4) {
  console.error(
    "Usage: ts-node scripts/generateMCQs.ts <path> <chapterId> <type> <numQuestionsPerTopic>",
  );

  process.exit(1);
}

const jsonPath = args[0];
const chapterId = args[1];
const type = args[2] as "theory" | "calculation";
const numQuestionsPerTopic = Number(args[3]);

generateMCQs(jsonPath, chapterId, type, numQuestionsPerTopic);
