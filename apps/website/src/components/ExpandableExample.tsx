"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Lightbulb } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

interface ExpandableExampleProps {
  number: number;
  question: string;
  solution: string;
}

const MD = {
  remarkPlugins: [remarkGfm, remarkMath],
  rehypePlugins: [rehypeKatex],
};

export default function ExpandableExample({
  number,
  question,
  solution,
}: ExpandableExampleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-10 rounded-xl border border-cyan-200 bg-white shadow-sm overflow-hidden">
      {/* Question Section */}
      <div className="p-6 border-b border-cyan-100">
        <div className="flex items-center gap-3 mb-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-100 text-xs font-semibold text-cyan-800">
            {number}
          </span>
          <h3 className="text-sm font-semibold text-cyan-900 uppercase tracking-wider">
            Example
          </h3>
        </div>

        <div className="text-neutral-700 text-[17px] leading-relaxed space-y-3">
          <ReactMarkdown {...(MD as any)}>{question}</ReactMarkdown>
        </div>
      </div>

      {/* Toggle */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between bg-cyan-50/40 px-6 py-3 text-sm font-medium text-cyan-800 transition hover:bg-cyan-50"
      >
        <span className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          {isOpen ? "Hide Solution" : "View Solution"}
        </span>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>

      {/* Solution */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="bg-neutral-50 px-6 py-5 border-t border-cyan-100">
              <div className="text-neutral-700 text-[17px] leading-relaxed space-y-3">
                <ReactMarkdown {...(MD as any)}>{solution}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
