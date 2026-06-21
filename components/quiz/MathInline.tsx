"use client";

import katex from "katex";

const safeRenderKatex = (latex: string) => {
  try {
    return katex.renderToString(latex || " ", {
      throwOnError: false,
      displayMode: false,
    });
  } catch {
    return `<span class="text-red-500">${latex}</span>`;
  }
};

const hasLatexSyntax = (text: string) => /[\\^_{}]/.test(text);

export default function MathInline({
  text,
  isPureMath = false,
}: {
  text: string;
  isPureMath?: boolean;
}) {
  if (isPureMath) {
    if (hasLatexSyntax(text)) {
      return (
        <span dangerouslySetInnerHTML={{ __html: safeRenderKatex(text) }} />
      );
    }
    return <span>{text}</span>;
  }

  const parts = text.split(/(\$.*?\$)/g);
  return (
    <span>
      {parts.map((part, idx) => {
        if (part.startsWith("$") && part.endsWith("$")) {
          const latex = part.slice(1, -1);
          return (
            <span
              key={idx}
              dangerouslySetInnerHTML={{ __html: safeRenderKatex(latex) }}
              className="mx-1 inline-block"
            />
          );
        }
        return (
          <span key={idx} className="whitespace-pre-wrap">
            {part}
          </span>
        );
      })}
    </span>
  );
}
