type McqPromptProp = {
  board: String;
  level: String;
  subject: String;
  code: String;
  chapterId: String;
  chapterTitle: String;
  topic: { id: String; title: String };
  formattedObjectives: String;
  numQuestionsPerTopic: Number;
};
export function theoryMcqPrompt({
  board,
  level,
  subject,
  code,
  chapterId,
  chapterTitle,
  topic,
  formattedObjectives,
  numQuestionsPerTopic,
}: McqPromptProp) {
  return `
You are an expert Cambridge International A Level Physics examiner.

Your task is to generate multiple choice questions for conceptual understanding.

SYLLABUS INFORMATION

Board: ${board}
Level: ${level}
Subject: ${subject}
Code: ${code}

Chapter ${chapterId}: ${chapterTitle}

Topic ${topic.id}: ${topic.title}

Learning Objectives:
${formattedObjectives}

TASK

Generate approximately ${numQuestionsPerTopic} conceptual multiple-choice questions.

These questions must test understanding of physics concepts, definitions, reasoning, and qualitative understanding.

Do NOT generate calculation-heavy questions.

QUESTION DESIGN RULES

• Each question must have exactly FOUR options.
• Only ONE option must be correct.
• Distractors must be plausible and reflect common misconceptions.
• Avoid obvious wrong answers.
• Avoid trivial wording differences.

DIFFICULTY LEVELS

Assign each question a difficulty level:

easy → definition recall or basic concept
medium → conceptual reasoning
hard → subtle conceptual trap or deeper understanding

LATEX RULES

Use LaTeX where appropriate.

Inline equations:

$v = u + at$

Display equations:

$$
F = ma
$$

Do NOT use \$begin:math:display$ \\$end:math:display$ or \$begin:math:text$ \\$end:math:text$.

OUTPUT FORMAT

Return ONLY valid JSON.

{
  "questions": [
    {
      "stem": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answer": 0,
      "explain": "Explanation of why the correct answer is correct.",
      "difficulty": "easy"
    }
  ]
}

IMPORTANT RULES

• "answer" must be the index of the correct option (0–3).
• There must always be exactly 4 options.
• Explanations must be short but clear.
• Ensure physics accuracy.
• Do not include any text outside the JSON object.
`;
}

export function calculationMcqPrompt({
  board,
  level,
  subject,
  code,
  chapterId,
  chapterTitle,
  topic,
  formattedObjectives,
  numQuestionsPerTopic,
}: McqPromptProp) {
  return `
        You are an expert Cambridge International A Level Physics examiner.
        
        Your task is to generate calculation-based multiple choice questions.
        
        SYLLABUS INFORMATION
        
        Board: ${board}
        Level: ${level}
        Subject: ${subject}
        Code: ${code}
        
        Chapter ${chapterId}: ${chapterTitle}
        
        Topic ${topic.id}: ${topic.title}
        
        Learning Objectives:
        ${formattedObjectives}
        
        TASK
        
        Generate approximately ${numQuestionsPerTopic} calculation-based multiple choice questions.
        
        These questions must require numerical reasoning or algebraic manipulation.
        
        Students should need to apply physics formulas to obtain the answer.
        
        QUESTION DESIGN RULES
        
        • Each question must have exactly FOUR options.
        • Only ONE option must be correct.
        • Options should include common calculation mistakes as distractors.
        • Use realistic physical values.
        • Ensure units are correct.
        
        Example distractor types:
        
        • arithmetic mistake
        • wrong formula
        • incorrect unit conversion
        • missing factor (½, g, etc)
        
        DIFFICULTY LEVELS
        
        Assign difficulty levels:
        
        easy → direct formula substitution
        medium → multi-step calculation
        hard → conceptual + calculation reasoning
        
        LATEX RULES
        
        Use LaTeX for all equations and units.
        
        Inline equations:
        
        $v = u + at$
        
        Display equations:
        
        $$
        v^2 = u^2 + 2as
        $$
        
        Units example:
        
        $10\\,\\text{m s}^{-1}$
        
        Do NOT use \$begin:math:display$ \\$end:math:display$ or \$begin:math:text$ \\$end:math:text$.
        
        OUTPUT FORMAT
        
        Return ONLY valid JSON.
        
        {
          "questions": [
            {
              "stem": "Question text",
              "options": [
                "$5\\,\\text{m s}^{-1}$",
                "$10\\,\\text{m s}^{-1}$",
                "$15\\,\\text{m s}^{-1}$",
                "$20\\,\\text{m s}^{-1}$"
              ],
              "answer": 1,
              "explain": "Using $v = u + at$ with $u = 0$, $a = 2$, $t = 5$, we get $v = 10\\,\\text{m s}^{-1}$.",
              "difficulty": "medium"
            }
          ]
        }
        
        IMPORTANT RULES
        
        • "answer" must be the index (0–3).
        • Always provide exactly four options.
        • Ensure calculations are correct.
        • Explanations must show the key physics step.
        • Do not include any text outside the JSON object.
        `;
}
