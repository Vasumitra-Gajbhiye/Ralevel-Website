"use client";

import ExpandableExample from "@/components/ExpandableExample";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Lightbulb,
  Sigma,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
// import BadgeCallout from "./BadgeCallout";
type Props = {
  content: string;
};

type CalloutType =
  | "definition"
  | "formula"
  | "example"
  | "solved"
  | "important"
  | "exam";

type CalloutBlock = {
  type: "callout";
  calloutType: CalloutType;
  body: string;
};

type TextBlock = {
  type: "text";
  body: string;
};

type Block = CalloutBlock | TextBlock;

const TAG_MAP: Record<string, CalloutType> = {
  "[!definition]": "definition",
  "[!formula]": "formula",
  "[!example]": "example",
  "[!solved-example]": "solved",
  "[!important]": "important",
  "[!exam-tip]": "exam",
};

const STYLES: Record<CalloutType, string> = {
  definition: "border-cyan-500 bg-cyan-50 my-10",
  formula: "border-indigo-500 bg-indigo-50 my-10",
  example: "border-green-500 bg-green-50 my-10",
  solved: "border-emerald-600 bg-emerald-50 my-10",
  important: "border-amber-500 bg-amber-50 my-10",
  exam: "border-purple-500 bg-purple-50 my-10",
};

const TITLES: Record<CalloutType, string> = {
  definition: "Definition",
  formula: "Formula",
  example: "Example",
  solved: "Solved Example",
  important: "Important",
  exam: "Exam Tip",
};

const ICONS: Record<CalloutType, React.ElementType> = {
  definition: BookOpen,
  formula: Sigma,
  example: Lightbulb,
  solved: CheckCircle2,
  important: AlertTriangle,
  exam: GraduationCap,
};

/**
 * Split markdown into alternating text/callout blocks by detecting
 * blockquotes that start with a [!tag]. Works entirely on the raw
 * markdown string — no React VDOM manipulation needed.
 */
function parseBlocks(markdown: string): Block[] {
  const lines = markdown.split("\n");
  const blocks: Block[] = [];

  let currentText: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Is this the start of a blockquote?
    if (line.trimStart().startsWith(">")) {
      // Collect all consecutive blockquote lines
      const bqLines: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith(">")) {
        bqLines.push(lines[i]);
        i++;
      }

      // Strip the "> " prefix to get raw content
      const rawContent = bqLines.map((l) => l.replace(/^>\s?/, "")).join("\n");

      // Check if first line is a callout tag
      const firstLine = rawContent.split("\n")[0].trim().toLowerCase();
      const calloutType = Object.entries(TAG_MAP).find(([tag]) =>
        firstLine.startsWith(tag)
      )?.[1];

      if (calloutType) {
        // Flush any accumulated text first
        if (currentText.length > 0) {
          blocks.push({ type: "text", body: currentText.join("\n") });
          currentText = [];
        }

        // Body is everything after the tag stripped from line 1, plus remaining lines
        const contentLines = rawContent.split("\n");
        const afterTag = contentLines[0].replace(/^\[!.*?\]\s*/i, "").trim();
        const rest = contentLines.slice(1).join("\n");
        const body = [afterTag, rest].filter(Boolean).join("\n").trim();

        blocks.push({ type: "callout", calloutType, body });
      } else {
        // Plain blockquote — put it back as markdown
        currentText.push(bqLines.join("\n"));
      }
    } else {
      currentText.push(line);
      i++;
    }
  }

  if (currentText.length > 0) {
    blocks.push({ type: "text", body: currentText.join("\n") });
  }

  return blocks;
}

export const MD_PROPS = {
  remarkPlugins: [remarkGfm, remarkMath],
  rehypePlugins: [rehypeKatex],
  components: {
    h2: ({ children }: any) => (
      <h2 className="text-3xl font-semibold mt-4 mb-6 pb-3 border-b border-neutral-200 text-neutral-900">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-2xl font-semibold mt-16 mb-4 text-cyan-700">
        {children}
      </h3>
    ),
    // h4: ({ children }: any) => (
    //   <h4 className="text-lg font-semibold mt-8 mb-3 text-cyan-800 bg-cyan-50 border border-cyan-100 px-4 py-2 rounded-lg">
    //     {children}
    //   </h4>
    // ),
    h4: ({ children }: any) => (
      <h4 className="text-lg font-semibold mt-8 mb-3 text-neutral-700 py-2 rounded-lg">
        {children}
      </h4>
    ),
    p: ({ children }: any) => (
      <p className="text-lg leading-relaxed mb-6 text-neutral-700">
        {children}
      </p>
    ),
    ul: ({ children }: any) => (
      <ul className="list-disc pl-6 space-y-3 mb-6 text-lg text-neutral-700 marker:text-cyan-500">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal pl-6 space-y-3 mb-6 text-lg text-neutral-700 marker:text-cyan-500">
        {children}
      </ol>
    ),
    strong: ({ children }: any) => (
      <strong className="font-semibold text-neutral-900">{children}</strong>
    ),
    a: ({ children, href }: any) => (
      <a
        href={href}
        className="text-cyan-700 font-medium underline underline-offset-4 hover:text-cyan-900 transition-colors"
      >
        {children}
      </a>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-cyan-500 bg-cyan-50 px-6 py-4 my-16 rounded-r-lg text-neutral-700">
        {children}
      </blockquote>
    ),
    code: ({ children }: any) => (
      <code className="bg-neutral-100 px-2 py-1 rounded text-sm font-mono">
        {children}
      </code>
    ),
    pre: ({ children }: any) => (
      <pre className="bg-neutral-900 text-neutral-100 p-6 rounded-xl overflow-x-auto my-8 text-sm">
        {children}
      </pre>
    ),
    hr: () => <hr className="my-12 border-neutral-200" />,
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-8">
        <table className="w-full border border-neutral-200 rounded-lg">
          {children}
        </table>
      </div>
    ),
    th: ({ children }: any) => (
      <th className="border-b border-neutral-200 px-4 py-3 text-left font-semibold bg-neutral-50">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="border-b border-neutral-100 px-4 py-3 text-neutral-700">
        {children}
      </td>
    ),
  },
};

// function CalloutBox({
//   calloutType,
//   body,
// }: {
//   calloutType: CalloutType;
//   body: string;
// }) {
//   const Icon = ICONS[calloutType];
//   return (
//     <div
//       className={`border-l-4 ${STYLES[calloutType]} px-6 py-5 my-16 rounded-r-xl shadow-sm`}
//     >
//       <div className="flex items-center gap-2 mb-3">
//         <Icon className="w-5 h-5 text-neutral-700" />
//         <div className="text-sm font-semibold tracking-wide uppercase text-neutral-700">
//           {TITLES[calloutType]}
//         </div>
//       </div>
//       <div className="text-neutral-700 space-y-3 text-[17px] leading-relaxed">
//         <ReactMarkdown {...(MD_PROPS as any)}>{body}</ReactMarkdown>
//       </div>
//     </div>
//   );
// }

const BOX_STYLES: Record<CalloutType, { bg: string; border: string }> = {
  definition: { bg: "bg-cyan-50/40", border: "border-cyan-200" },
  formula: { bg: "bg-indigo-50/40", border: "border-indigo-200" },
  example: { bg: "bg-green-50/40", border: "border-green-200" },
  solved: { bg: "bg-emerald-50/40", border: "border-emerald-200" },
  important: { bg: "bg-amber-50/40", border: "border-amber-200" },
  exam: { bg: "bg-purple-50/40", border: "border-purple-200" },
};

export function CalloutBox({
  calloutType,
  body,
}: {
  calloutType: CalloutType;
  body: string;
}) {
  const Icon = ICONS[calloutType];
  const style = BOX_STYLES[calloutType];

  return (
    <div
      className={`my-16 rounded-xl border ${style.border} ${style.bg} p-6 shadow-sm`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5 text-neutral-800" />
        <div className="text-sm font-bold tracking-wide uppercase text-neutral-800">
          {TITLES[calloutType]}
        </div>
      </div>

      {/* Restored your exact markdown implementation */}
      <div className="text-neutral-700 space-y-3 text-[17px] leading-relaxed">
        <ReactMarkdown {...(MD_PROPS as any)}>{body}</ReactMarkdown>
      </div>
    </div>
  );
}

export default function MarkdownRenderer({ content }: Props) {
  const blocks = parseBlocks(content);
  let exampleCount = 0;

  return (
    <div className="max-w-4xl mx-auto pb-10 [&_.katex-display]:my-10 [&_.katex-display]:bg-neutral-50 [&_.katex-display]:border [&_.katex-display]:border-neutral-200 [&_.katex-display]:rounded-lg [&_.katex-display]:py-4 [&_.katex-display]:px-6 [&_.katex-display]:overflow-x-auto">
      {blocks.map((block, idx) =>
        block.type === "callout" ? (
          block.calloutType === "solved" ? (
            (() => {
              exampleCount++;
              // simple split: first paragraph = question, rest = solution
              const parts = block.body.split("\n\n");
              const question = parts[0] || "";
              const solution = parts.slice(1).join("\n\n") || "";
              return (
                <ExpandableExample
                  key={idx}
                  number={exampleCount}
                  question={question}
                  solution={solution}
                />
              );
            })()
          ) : (
            <CalloutBox
              key={idx}
              calloutType={block.calloutType}
              body={block.body}
            />
          )
        ) : (
          <ReactMarkdown key={idx} {...(MD_PROPS as any)}>
            {block.body}
          </ReactMarkdown>
        )
      )}
    </div>
  );
}
