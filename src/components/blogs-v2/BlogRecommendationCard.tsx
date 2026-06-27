"use client";

import AuthorAvatar from "@/components/blogs-v2/AuthorAvatar";
import type { BlogRecommendation } from "@/components/blogs-v2/dummyBlogRecommendations";
import {
  MessageCircle,
  MoreHorizontal,
  Star,
  ThumbsDown,
} from "lucide-react";

function ClapIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M7 11v5a2 2 0 0 0 2 2h1" />
      <path d="M11 7.5V5a2 2 0 1 1 4 0v8" />
      <path d="M11 11v6.5a2 2 0 0 0 2 2h1.5" />
      <path d="M15 7.5V5a2 2 0 1 1 4 0v6.5" />
      <path d="M15 11v4.5a2 2 0 0 0 2 2H19" />
    </svg>
  );
}

export default function BlogRecommendationCard({
  item,
}: {
  item: BlogRecommendation;
}) {
  return (
    <article className="flex flex-col">
      <div
        className="w-full aspect-[16/10] rounded-sm bg-neutral-200"
        aria-hidden
      />

      <div className="mt-3 flex items-center gap-2 text-sm text-neutral-600 min-w-0">
        <AuthorAvatar author={item.author} className="h-5 w-5" />
        <span className="truncate">
          {item.publication && (
            <>
              <span>In </span>
              <span className="text-black">{item.publication}</span>
              <span> by </span>
            </>
          )}
          <span className="text-black">{item.author}</span>
          <span className="text-neutral-400"> · </span>
          <span>{item.dateLabel}</span>
        </span>
      </div>

      <h3 className="mt-2 text-lg font-bold leading-snug text-black line-clamp-2">
        {item.title}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-neutral-500 line-clamp-2">
        {item.description}
      </p>

      <div className="mt-4 flex items-center justify-between text-neutral-500">
        <div className="flex items-center gap-4 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <ClapIcon className="h-4 w-4" />
            {item.claps}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4" />
            {item.comments}
          </span>
          {item.starred && (
            <Star className="h-4 w-4 fill-neutral-400 text-neutral-400" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-1 hover:text-neutral-800 transition-colors"
            aria-label="Not interested"
          >
            <ThumbsDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="p-1 hover:text-neutral-800 transition-colors"
            aria-label="More options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
