// // app/api/evaluate/route.ts
// import { NextResponse } from "next/server";
// import OpenAI from "openai";

// // Initialize the OpenAI client (ensure OPENAI_API_KEY is in your .env.local)
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export async function POST(req: Request) {
//   try {
//     const { question, markscheme, answer } = await req.json();

//     const prompt = `You are an expert A level theory examiner grading a student's answer.

//     Question: ${question}
//     Markscheme (Award 1 mark per point, max ${markscheme.length} marks):
//     ${markscheme.map((m: string) => `- ${m}`).join("\n")}

//     Student's Answer:
//     ${answer}

//     Evaluate the student's answer against the markscheme.
//     You must return a JSON object EXACTLY matching this structure:
//     {
//       "score": <total_marks_awarded_as_number>,
//       "points": [
//         {
//           "awarded": <boolean_true_if_point_met>,
//           "text": "<the_exact_markscheme_point_text>",
//           "reason": "<brief_explanation_of_why_it_was_awarded_or_missed>"
//         }
//       ]
//     }`;

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4.1-mini", // Using the model you specified
//       messages: [{ role: "user", content: prompt }],
//       // Force the model to return a valid JSON object
//       response_format: { type: "json_object" },
//     });
//     const usage = completion.usage;

//     console.log(`Input tokens: ${usage?.prompt_tokens}`);
//     console.log(`Output tokens: ${usage?.completion_tokens}`);
//     console.log(`Total tokens: ${usage?.total_tokens}`);

//     const result = JSON.parse(completion.choices[0].message.content || "{}");
//     // console.log(result);
//     return NextResponse.json(result);
//   } catch (error) {
//     console.error("Evaluation error:", error);
//     return NextResponse.json(
//       { error: "Failed to evaluate answer." },
//       { status: 500 }
//     );
//   }
// }

// app/api/evaluate/route.ts
import { getAuthSession } from "@/lib/getAuthSession";
import { enforceRateLimit } from "@/lib/rateLimit";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";

const MAX_REQUEST_BYTES = 32 * 1024;
const MAX_QUESTION_CHARS = 4000;
const MAX_ANSWER_CHARS = 8000;
const MAX_MARKSCHEME_ITEMS = 30;
const MAX_MARKSCHEME_POINT_CHARS = 500;

// Initialize the Google Gen AI client (ensure GEMINI_API_KEY is in your .env.local)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function validatePayload(body: unknown):
  | { ok: true; question: string; markscheme: string[]; answer: string }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Invalid request body." };
  }

  const { question, markscheme, answer } = body as Record<string, unknown>;

  if (typeof question !== "string" || question.trim().length === 0) {
    return { ok: false, error: "Question is required." };
  }
  if (question.length > MAX_QUESTION_CHARS) {
    return { ok: false, error: "Question is too long." };
  }

  if (typeof answer !== "string" || answer.trim().length === 0) {
    return { ok: false, error: "Answer is required." };
  }
  if (answer.length > MAX_ANSWER_CHARS) {
    return { ok: false, error: "Answer is too long." };
  }

  if (!Array.isArray(markscheme) || markscheme.length === 0) {
    return { ok: false, error: "Markscheme is required." };
  }
  if (markscheme.length > MAX_MARKSCHEME_ITEMS) {
    return { ok: false, error: "Markscheme has too many points." };
  }
  for (const point of markscheme) {
    if (typeof point !== "string" || point.length > MAX_MARKSCHEME_POINT_CHARS) {
      return { ok: false, error: "Invalid markscheme point." };
    }
  }

  return { ok: true, question, markscheme, answer };
}

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ipRlError = await enforceRateLimit(req, "theory-eval:ip", {
    limit: 15,
    windowSec: 15 * 60,
  });
  if (ipRlError) return ipRlError;

  const userRlError = await enforceRateLimit(
    req,
    "theory-eval:user",
    { limit: 10, windowSec: 15 * 60 },
    session.userId
  );
  if (userRlError) return userRlError;

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validated = validatePayload(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { question, markscheme, answer } = validated;

  try {

    const prompt = `You are an expert A level theory examiner grading a student's answer.
    
    Question: ${question}
    Markscheme (Award 1 mark per point, max ${markscheme.length} marks):
    ${markscheme.map((m: string) => `- ${m}`).join("\n")}
    
    Student's Answer:
    ${answer}`;

    // Initialize the specific model and define the strict JSON schema
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            score: {
              type: SchemaType.NUMBER,
              description: "The total marks awarded based on the markscheme.",
            },
            points: {
              type: SchemaType.ARRAY,
              description:
                "List of evaluations for each point in the markscheme.",
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  awarded: {
                    type: SchemaType.BOOLEAN,
                    description: "true if the student met this point",
                  },
                  text: {
                    type: SchemaType.STRING,
                    description: "the exact text of the markscheme point",
                  },
                  reason: {
                    type: SchemaType.STRING,
                    description:
                      "brief explanation of why it was awarded or missed",
                  },
                },
                required: ["awarded", "text", "reason"],
              },
            },
          },
          required: ["score", "points"],
        },
      },
    });

    // Generate content using the prompt and schema
    const result = await model.generateContent(prompt);
    const response = result.response;

    // Extract and log token usage
    const usage = response.usageMetadata;
    if (usage) {
      console.log(`Input tokens: ${usage.promptTokenCount}`);
      console.log(`Output tokens: ${usage.candidatesTokenCount}`);
      console.log(`Total tokens: ${usage.totalTokenCount}`);
    }

    // Parse the guaranteed JSON text
    const evaluationData = JSON.parse(response.text());

    return NextResponse.json(evaluationData);
  } catch (error) {
    console.error("Evaluation error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate answer." },
      { status: 500 }
    );
  }
}
