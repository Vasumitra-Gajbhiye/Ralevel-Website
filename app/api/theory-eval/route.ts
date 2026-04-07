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
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize the Google Gen AI client (ensure GEMINI_API_KEY is in your .env.local)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { question, markscheme, answer } = await req.json();

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
