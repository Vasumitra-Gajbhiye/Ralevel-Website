import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";
import OpenAI from "openai";
import path from "path";
import TopicModel from "../src/models/Topic";

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

async function generateNotes(jsonPath: string, chapterId: string) {
  try {
    // -------------------------
    // Load JSON file
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

    // -------------------------
    // Extract metadata
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

    for (let i = 0; i < chapter.topics.length; i++) {
      const topic = chapter.topics[i];

      const previousTopic = i > 0 ? chapter.topics[i - 1].title : "None";
      const nextTopic =
        i < chapter.topics.length - 1 ? chapter.topics[i + 1].title : "None";

      const formattedObjectives = topic.learningObjectives
        .map((obj) => `- ${obj}`)
        .join("\n");

      const prompt = `
You are an expert Cambridge A-Level physics teacher.

Write clear, concise revision notes for the following syllabus topic.

Board: ${board}
Level: ${level}
Subject: ${subject}
Code: ${code}

Chapter ${chapterId}: ${chapterTitle}
Topic ${topic.id}: ${topic.title}

Previous Topic: ${previousTopic}
Next Topic: ${nextTopic}

Learning Objectives:
${formattedObjectives}

Follow this structure strictly:

## ${topic.title}

Explanation of the concept.

Use optional callouts where useful. Each callout MUST follow this exact format —
the tag is alone on line 1, content starts on line 2, blank line before and after:

> [!definition]
> A scalar quantity has magnitude only, with no direction.

> [!example]
> - The mass of a textbook: about 1 kg
> - The height of a door: about 2 m

> [!formula]
> $$
> F = ma
> $$

> [!solved-example]
> **Find the acceleration of a 2 kg object with 10 N force.**
> Using $F = ma$: $a = \frac{10}{2} = 5\ \text{m s}^{-2}$

> [!important]
> Always include units with every physical quantity.

> [!exam-tip]
> Show all working in calculations, even if the answer seems obvious.

Available callout types: [!definition] [!formula] [!example] [!solved-example] [!important] [!exam-tip]

CALLOUT USAGE RULES

Callouts should be used sparingly.

Guidelines:
- Most content should be normal paragraph text.
- Use callouts only for information that must stand out.

Use callouts for:
• formal definitions
• key formulas
• exam tips
• important conceptual warnings
• worked examples

Do NOT wrap ordinary explanations or lists in callouts.

Typically only 1–3 callouts should appear per topic section.

MATHEMATICAL FORMATTING RULES

Use ONLY these LaTeX formats:

Inline math:
$E = mc^2$

Display equations:
$$
F = ma
$$

Do NOT use \[ \] or \( \).

Do NOT include navigation text such as:
"Next Topic", "Previous Topic", or links to other sections.

Return ONLY markdown.
`;

      // -------------------------
      // PASS 1: Generate Notes (Your existing code)
      // -------------------------
      console.log(`\nGenerating notes for topic ${topic.id} - ${topic.title}`);

      const notesResponse = await client.chat.completions.create({
        model: "gpt-4.1", // or whichever model you prefer
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4000,
        temperature: 0.3,
      });

      const rawMarkdown = notesResponse.choices[0].message.content?.trim();

      if (!rawMarkdown) {
        console.error(`No markdown returned for topic ${topic.id}`);
        continue;
      }

      // -------------------------
      // PASS 2: The Art Director
      // -------------------------
      console.log(`Injecting illustration prompts for topic ${topic.id}...`);

      const artDirectorPrompt = `
You are the Art Director for a modern, minimalist educational platform. 

Your task is to read the provided physics revision notes and identify exactly where 1 to 3 illustrations are necessary to help a student visualize the concept.

Inject standard markdown image tags directly into the text where the illustrations should appear.

Format strictly like this:
![<Detailed description of the image for the graphic designer. Remind them to keep it clean, minimal, and aligned with a modern UI aesthetic>](PENDING_IMAGE_URL)

EXAMPLE:
The normal force pushes back up.
![A simple 2D free body diagram of a box on a flat surface. Draw a downward arrow labeled 'mg' and an upward arrow labeled 'N'. Keep the line work clean and minimalist.](PENDING_IMAGE_URL)
This means the net force is zero.

RULES:
1. Do NOT rewrite, summarize, or alter ANY of the original text, formulas, or callouts. 
2. ONLY insert the markdown image tags. Place them on their own lines between existing paragraphs.
3. Return the complete, updated markdown.

ORIGINAL NOTES:
${rawMarkdown}
`;

      const artResponse = await client.chat.completions.create({
        model: "gpt-4.1",
        messages: [{ role: "user", content: artDirectorPrompt }],
        max_tokens: 4000,
        temperature: 0.1, // Very low temperature so it doesn't get creative with the existing text
      });

      const finalMarkdown =
        artResponse.choices[0].message.content?.trim() || rawMarkdown;
      // -------------------------
      // Save to Database
      // -------------------------
      const slug = topic.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      await TopicModel.findOneAndUpdate(
        {
          board,
          level,
          subject,
          code,
          topicId: topic.id,
        },
        {
          board,
          level,
          subject,
          code,
          chapter: chapterId,
          chapterTitle,
          chapterSlug,
          topicId: topic.id,
          slug,
          title: topic.title,
          detailedNotesMarkdown: finalMarkdown,
          published: true,
        },
        { upsert: true, new: true },
      );

      console.log(`Saved notes for topic ${topic.id}`);
    }
    console.log(
      `\nFinished generating notes for Chapter ${chapterId}: ${chapterTitle}`,
    );
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
  }
}

// -------------------------
// CLI Arguments
// -------------------------

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error(
    "Usage: npx tsx scripts/generateNotes.ts lib/syllabusJson/cambridge/<subjectaname> <chapterId>",
  );
  process.exit(1);
}

const jsonPath = args[0];
const chapterId = args[1];

// Run
generateNotes(jsonPath, chapterId);
