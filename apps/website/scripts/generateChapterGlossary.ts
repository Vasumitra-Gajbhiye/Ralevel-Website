import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";
import OpenAI from "openai";
import path from "path";
import GlossaryModel from "../src/models/Glossary";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set");

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

type GlossaryTerm = {
  term: string;
  definition: string;
  topics?: string[];
};

type GlossaryResponse = {
  terms: GlossaryTerm[];
};

async function generateGlossary(jsonPath: string, chapterId: string) {
  try {
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

    const board = data.board;
    const level = data.level;
    const subject = data.subject;
    const code = data.code;

    const chapterTitle = chapter.title;

    const chapterSlug = chapterTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // -------------------------
    // Prepare chapter context
    // -------------------------

    const topicList = chapter.topics
      .map((t) => `${t.id} ${t.title}`)
      .join("\n");

    const learningObjectives = chapter.topics
      .map((topic) => topic.learningObjectives.map((o) => `- ${o}`).join("\n"))
      .join("\n");

    // -------------------------
    // Dummy prompt
    // -------------------------

    const prompt = `

You are a subject editor writing glossary definitions for Cambridge International Education A Level Physics.

Your task is to produce a glossary for ONE syllabus chapter.

The glossary must follow the style used in Cambridge physics textbooks and exam board glossaries:
- concise
- precise
- technically correct
- no teaching language
- no conversational tone

The definitions must read like formal glossary entries.

----------------------------------------

SYLLABUS INFORMATION

Board: ${board}
Level: ${level}
Subject: ${subject}
Code: ${code}

Chapter ${chapterId}: ${chapterTitle}

Topics in this chapter:
${topicList}

Learning objectives:
${learningObjectives}

----------------------------------------

TASK

Identify the key technical physics terms that students must understand in order to learn this chapter.

Then write glossary definitions for those terms.

----------------------------------------

STRICT TERM SELECTION RULES

Only include terms that satisfy ALL of the following:

1. The term appears explicitly in the learning objectives OR
2. The term is a fundamental physics concept required to understand the objectives.

Do NOT include:
- general English words
- example objects (e.g. "car", "ball", "book")
- variable symbols (v, F, a)
- units alone (kg, m, s)
- phrases describing actions (e.g. "calculate acceleration")
- terms that belong to later chapters

Each term must be a real physics concept.

Examples of good glossary terms:
vector
scalar
resultant force
terminal velocity
diffraction
coherence
potential difference
resistivity

----------------------------------------

DEFINITION RULES

Definitions must follow Cambridge glossary style:

1. Maximum 1–2 sentences.
2. Use formal physics language.
3. No examples unless essential.
4. Do NOT explain how to solve problems.
5. Do NOT include equations unless absolutely necessary.
6. Do NOT reference exams or students.

Examples of correct style:

Scalar  
A physical quantity that has magnitude only and no direction.

Vector  
A physical quantity that has both magnitude and direction.

Terminal velocity  
The constant velocity reached when the resultant force on a moving object becomes zero.

----------------------------------------

TOPIC TAGGING

Each glossary term must include the topic IDs where the concept appears.

Example:

vector → ["1.4"]

----------------------------------------

OUTPUT FORMAT

Return ONLY valid JSON.

Do not include markdown.

Structure:

{
  "terms": [
    {
      "term": "Vector",
      "definition": "A physical quantity that has both magnitude and direction.",
      "topics": ["1.4"]
    },
    {
      "term": "Scalar",
      "definition": "A physical quantity that has magnitude only and no direction.",
      "topics": ["1.4"]
    }
  ]
}

----------------------------------------

QUALITY REQUIREMENTS

Before returning the glossary, verify that:

• each term is a real physics concept  
• definitions are scientifically correct  
• definitions match Cambridge syllabus language  
• definitions are concise  
• no duplicate terms exist  

Return only the JSON object.
    `;

    console.log(`Generating glossary for Chapter ${chapterId}`);

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: prompt,
      max_output_tokens: 2000,
      temperature: 0.1,
    });

    const rawOutput = response.output_text?.trim();

    if (!rawOutput) {
      throw new Error("No output returned from AI");
    }

    const parsed: GlossaryResponse = JSON.parse(rawOutput);

    await connectDB();

    // -------------------------
    // Process glossary terms
    // -------------------------

    for (const entry of parsed.terms) {
      const term = entry.term.trim();
      const definition = entry.definition.trim();

      const slug = term
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const topics = entry.topics || [];

      const existing = await GlossaryModel.findOne({
        term,
        board,
        level,
        subject,
        code,
      });

      if (existing) {
        console.log(`Updating existing term: ${term}`);

        const updatedChapters = Array.from(
          new Set([...(existing.chapters || []), chapterSlug]),
        );

        const updatedTopics = Array.from(
          new Set([...(existing.topics || []), ...topics]),
        );

        await GlossaryModel.updateOne(
          { _id: existing._id },
          {
            $set: {
              definition: existing.definition || definition,
            },
            $setOnInsert: {
              slug,
            },
            $addToSet: {
              chapters: { $each: [chapterSlug] },
              topics: { $each: topics },
            },
          },
        );
      } else {
        console.log(`Creating new term: ${term}`);

        await GlossaryModel.create({
          term,
          slug,
          definition,
          board,
          level,
          subject,
          code,
          chapters: [chapterSlug],
          topics,
        });
      }
    }

    console.log(
      `Finished glossary generation for Chapter ${chapterId}: ${chapterTitle}`,
    );

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
  }
}

// -------------------------
// CLI
// -------------------------

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error(
    "Usage: ts-node scripts/generateChapterGlossary.ts <path-to-json> <chapterId>",
  );
  process.exit(1);
}

const jsonPath = args[0];
const chapterId = args[1];

generateGlossary(jsonPath, chapterId);
