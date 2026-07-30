'use client';

import 'katex/dist/katex.min.css';
import { type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

type MathTextProps = {
  text: string;
  inline?: boolean;
};

export default function MathText({ text, inline = false }: MathTextProps) {
  if (inline) {
    return (
      <span className="math-inline">
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            p: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
          }}
        >
          {text}
        </ReactMarkdown>
      </span>
    );
  }

  return (
    <div className="math-block">
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {text}
      </ReactMarkdown>
    </div>
  );
}
