// import Topic from "@/models/Topic";
// import dotenv from "dotenv";
// import fs from "fs";
// import mongoose from "mongoose";
// import OpenAI from "openai";
// import path from "path";

// dotenv.config();

// const client = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// async function connectDB() {
//   if (mongoose.connection.readyState === 1) return;
//   const uri = process.env.MONGODB_URI;
//   if (!uri) throw new Error("MONGODB_URI not set");
//   await mongoose.connect(uri);
// }

// // -------------------------
// // Types
// // -------------------------

// type Topic = {
//   id: string;
//   title: string;
//   learningObjectives: string[];
// };

// type Section = {
//   id: string;
//   title: string;
//   topics: Topic[];
// };

// type LearningObjectivesFile = {
//   board: string;
//   level: string;
//   subject: string;
//   code: string;
//   sections: Section[];
// };

// // -------------------------
// // Main Function
// // -------------------------

// async function generateFlashcards(
//   jsonPath: string,
//   chapterId: string,
//   targetTopicId?: string
// ) {
//   try {
//     const absolutePath = path.resolve(jsonPath);

//     if (!fs.existsSync(absolutePath)) {
//       throw new Error(`File not found: ${absolutePath}`);
//     }

//     const raw = fs.readFileSync(absolutePath, "utf-8");
//     const data: LearningObjectivesFile = JSON.parse(raw);

//     const chapter = data.sections.find((s) => s.id === chapterId);

//     if (!chapter) {
//       throw new Error(`Chapter ${chapterId} not found`);
//     }

//     // Filter topics: if targetTopicId is provided, only process that one. Otherwise, process all.
//     const topicsToProcess = targetTopicId
//       ? chapter.topics.filter((t) => t.id === targetTopicId)
//       : chapter.topics;

//     if (topicsToProcess.length === 0) {
//       throw new Error(
//         targetTopicId
//           ? `Topic ${targetTopicId} not found in chapter ${chapterId}`
//           : `No topics found in chapter ${chapterId}`
//       );
//     }

//     const { board, level, subject, code } = data;
//     const chapterTitle = chapter.title;

//     const chapterSlug = chapterTitle
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, "-")
//       .replace(/(^-|-$)/g, "");

//     await connectDB();

//     for (const topic of topicsToProcess) {
//       console.log(`\nGenerating flashcards for ${topic.id} - ${topic.title}`);

//       const formattedObjectives = topic.learningObjectives
//         .map((obj) => `- ${obj}`)
//         .join("\n");
//       // 🔥 KEEP EMPTY FOR NOW (as you asked)
//       const prompt = `
// You are an expert Cambridge A-Level examiner.

// Your task is to convert syllabus learning objectives into high-quality flashcards for active recall.

// RULES:

// - Each flashcard must test ONE clear concept
// - Questions must be short, precise, and exam-focused
// - Answers must be concise but complete
// - Avoid vague questions like "Explain..." or "What do you know about..."
// - Prefer direct recall questions:
//   - Definitions
//   - Units
//   - Laws
//   - Relationships
//   - Applications

// - Split complex objectives into multiple flashcards
// - Avoid repeating the same idea
// - Use proper physics terminology
// - Use LaTeX ($$ $$) for formulas when needed

// HINT RULES:
// - Include a hint ONLY if it genuinely helps recall
// - Keep hints short (1 line max)

// TAGS:
// - Always include:
//   - subject ("physics")
//   - topic name (slug format)

// OUTPUT FORMAT (STRICT JSON ONLY):

// {
//   "cards": [
//     {
//       "question": "...",
//       "answer": "...",
//       "hint": "...",
//       "tags": ["physics", "topic-name"]
//     }
//   ]
// }

// DO NOT:
// - include explanations outside JSON
// - include markdown
// - include extra text

// ---

// Board: ${board}
// Level: ${level}
// Subject: ${subject}
// Code: ${code}

// Chapter: ${chapterTitle}
// Topic: ${topic.title}

// Learning Objectives:
// ${formattedObjectives}
// `;

//       const response = await client.responses.create({
//         model: "gpt-4.1",
//         input: prompt,
//         max_output_tokens: 3000,
//         temperature: 0.3,
//       });

//       const output = response.output_text?.trim();

//       if (!output) {
//         console.error(`No output for topic ${topic.id}`);
//         continue;
//       }

//       let parsed;
//       try {
//         parsed = JSON.parse(output);
//       } catch (err) {
//         console.error(`Invalid JSON for topic ${topic.id}`);
//         continue;
//       }

//       if (!parsed.cards || !Array.isArray(parsed.cards)) {
//         console.error(`No cards array for topic ${topic.id}`);
//         continue;
//       }

//       // 🔥 Add metadata + IDs
//       const cards = parsed.cards.map((card: any, index: number) => ({
//         ...card,
//         id: `${code}-${chapterId}-${topic.id}-${index}`,
//         topicId: topic.id,
//         topic: topic.title,
//         chapter: chapterId,
//         chapterTitle,
//         board,
//         level,
//         subject,
//       }));

//       // -------------------------
//       // SAVE (choose strategy)
//       // -------------------------

//       // Option 1: Save inside Topic (recommended for now)
//       await Topic.findOneAndUpdate(
//         {
//           board,
//           level,
//           subject,
//           code,
//           topicId: topic.id,
//         },
//         {
//           $set: {
//             board,
//             level,
//             subject,
//             code,
//             chapter: chapterId,
//             chapterTitle,
//             chapterSlug,
//             topicId: topic.id,
//             title: topic.title,
//             flashcards: cards,
//             updatedAt: new Date(),
//           },
//         },
//         { upsert: true, new: true }
//       );

//       console.log(`Saved flashcards for topic ${topic.id}`);
//     }

//     console.log(
//       `\nFinished flashcards for Chapter ${chapterId}: ${chapterTitle}`
//     );

//     process.exit(0);
//   } catch (error) {
//     console.error("Error:", error);
//   }
// }

// // -------------------------
// // CLI
// // -------------------------

// const args = process.argv.slice(2);

// if (args.length < 2) {
//   console.error(
//     "Usage: ts-node scripts/generateFlashcards.ts <jsonPath> <chapterId> [topicId]"
//   );
//   process.exit(1);
// }

// const jsonPath = args[0];
// const chapterId = args[1];
// const targetTopicId = args[2]; // This will be undefined if not provided

// generateFlashcards(jsonPath, chapterId, targetTopicId);

import Topic from "@/models/Topic";
import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";
import OpenAI from "openai";
import path from "path";

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
// Main Function
// -------------------------

async function generateFlashcards(
  jsonPath: string,
  chapterId: string,
  targetTopicId?: string,
) {
  try {
    const absolutePath = path.resolve(jsonPath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${absolutePath}`);
    }

    const raw = fs.readFileSync(absolutePath, "utf-8");
    const data: LearningObjectivesFile = JSON.parse(raw);

    const chapter = data.sections.find((s) => s.id === chapterId);

    if (!chapter) {
      throw new Error(`Chapter ${chapterId} not found`);
    }

    // Filter topics: if targetTopicId is provided, only process that one. Otherwise, process all.
    const topicsToProcess = targetTopicId
      ? chapter.topics.filter((t) => t.id === targetTopicId)
      : chapter.topics;

    if (topicsToProcess.length === 0) {
      throw new Error(
        targetTopicId
          ? `Topic ${targetTopicId} not found in chapter ${chapterId}`
          : `No topics found in chapter ${chapterId}`,
      );
    }

    const { board, level, subject, code } = data;
    const chapterTitle = chapter.title;

    const chapterSlug = chapterTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    await connectDB();

    for (const topic of topicsToProcess) {
      console.log(`\nGenerating flashcards for ${topic.id} - ${topic.title}`);

      const formattedObjectives = topic.learningObjectives
        .map((obj) => `- ${obj}`)
        .join("\n");

      const prompt = `
You are an expert Cambridge A-Level examiner.

Your task is to convert syllabus learning objectives into high-quality flashcards for active recall.

RULES:

- Each flashcard must test ONE clear concept
- Questions must be short, precise, and exam-focused
- Answers must be concise but complete
- Avoid vague questions like "Explain..." or "What do you know about..."
- Prefer direct recall questions:
  - Definitions
  - Units
  - Laws
  - Relationships
  - Applications

- Split complex objectives into multiple flashcards
- Submit minimum 10 flashcards
- Avoid repeating the same idea
- Use proper physics terminology
- Use LaTeX ($$ $$) for formulas when needed

HINT RULES:
- Include a hint ONLY if it genuinely helps recall
- Keep hints short (1 line max)

TAGS:
- Always include:
  - subject ("physics")
  - topic name (slug format)

OUTPUT FORMAT (STRICT JSON ONLY):

{
  "description": "A less than 10 words overview of what these flashcards test.",
  "difficulty": "Easy", // Choose one: Easy, Medium, Hard
  "cards": [
    {
      "question": "...",
      "answer": "...",
      "hint": "...",
      "tags": ["physics", "topic-name"]
    }
  ]
}

DO NOT:
- include explanations outside JSON
- include markdown
- include extra text

---

Board: ${board}
Level: ${level}
Subject: ${subject}
Code: ${code}

Chapter: ${chapterTitle}
Topic: ${topic.title}

Learning Objectives:
${formattedObjectives}
`;

      const response = await client.responses.create({
        model: "gpt-4", // Note: Ensure you are using a valid model like gpt-4 or gpt-4-turbo
        input: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      const output = response.output_text?.trim();

      if (!output) {
        console.error(`No output for topic ${topic.id}`);
        continue;
      }

      let parsed;
      try {
        parsed = JSON.parse(output);
      } catch (err) {
        console.error(`Invalid JSON for topic ${topic.id}`);
        continue;
      }

      if (!parsed.cards || !Array.isArray(parsed.cards)) {
        console.error(`No cards array for topic ${topic.id}`);
        continue;
      }

      // 🔥 Extract Metadata
      const description =
        parsed.description || `Active recall flashcards for ${topic.title}`;
      const difficulty = parsed.difficulty || "Intermediate";
      const numberOfCards = parsed.cards.length;

      // 🔥 Add metadata + IDs to individual cards
      const cards = parsed.cards.map((card: any, index: number) => ({
        ...card,
        id: `${code}-${chapterId}-${topic.id}-${index}`,
        topicId: topic.id,
        topic: topic.title,
        chapter: chapterId,
        chapterTitle,
        board,
        level,
        subject,
      }));

      // -------------------------
      // SAVE
      // -------------------------

      await Topic.findOneAndUpdate(
        {
          board,
          level,
          subject,
          code,
          topicId: topic.id,
        },
        {
          $set: {
            board,
            level,
            subject,
            code,
            chapter: chapterId,
            chapterTitle,
            chapterSlug,
            topicId: topic.id,
            title: topic.title,
            // 🔥 Save with the new schema structure
            flashcards: {
              description,
              difficulty,
              numberOfCards,
              cards: cards,
            },
            updatedAt: new Date(),
          },
        },
        { upsert: true, new: true },
      );

      console.log(`Saved ${numberOfCards} flashcards for topic ${topic.id}`);
    }

    console.log(
      `\nFinished flashcards for Chapter ${chapterId}: ${chapterTitle}`,
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
    "Usage: ts-node scripts/generateFlashcards.ts <jsonPath> <chapterId> [topicId]",
  );
  process.exit(1);
}

const jsonPath = args[0];
const chapterId = args[1];
const targetTopicId = args[2]; // This will be undefined if not provided

generateFlashcards(jsonPath, chapterId, targetTopicId);
