"use client";

import type { FlashcardMedia } from "@/types/topic-flashcards";
import { cn } from "@/lib/utils";
import "katex/dist/katex.min.css";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

type FlashcardContentRendererProps = {
  text: string;
  media?: FlashcardMedia;
  className?: string;
  size?: "default" | "sm";
};

export default function FlashcardContentRenderer({
  text,
  media,
  className,
  size = "default",
}: FlashcardContentRendererProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {media && media.images.length > 0 && (
        <FlashcardImageGrid media={media} />
      )}
      <FlashcardMarkdown content={text} size={size} />
    </div>
  );
}

function FlashcardImageGrid({ media }: { media: FlashcardMedia }) {
  const { images, columns } = media;

  return (
    <div
      className="grid gap-3"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {images.map((image, index) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${image.src}-${index}`}
          src={image.src}
          alt={image.alt}
          className="w-full h-auto max-h-56 object-cover border border-slate-200"
        />
      ))}
    </div>
  );
}

function FlashcardMarkdown({
  content,
  size,
}: {
  content: string;
  size: "default" | "sm";
}) {
  return (
    <div className="[&_.katex-display]:my-4 [&_.katex-display]:overflow-x-auto [&_p]:m-0 [&_p+p]:mt-3">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children }) => (
            <p
              className={cn(
                "font-medium text-ink leading-relaxed",
                size === "sm"
                  ? "text-sm text-slate-600"
                  : "text-2xl sm:text-3xl",
              )}
            >
              {children}
            </p>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
