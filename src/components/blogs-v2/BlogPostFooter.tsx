"use client";

import BlogPostActionButtons from "@/components/blogs-v2/BlogPostActionButtons";
import { parseBlogTags } from "@/lib/parseBlogTags";

type BlogPostFooterProps = {
  tag?: string;
  clapCount?: number;
  commentCount?: number;
  liked?: boolean;
  onLikeClick?: () => void;
  onCommentClick?: () => void;
  likeDisabled?: boolean;
};

export default function BlogPostFooter({
  tag,
  clapCount = 0,
  commentCount = 0,
  liked = false,
  onLikeClick,
  onCommentClick,
  likeDisabled = false,
}: BlogPostFooterProps) {
  const tags = parseBlogTags(tag);

  if (tags.length === 0) {
    return (
      <footer className="mt-12 pt-8 border-t border-neutral-200">
        <BlogPostActionButtons
          clapCount={clapCount}
          commentCount={commentCount}
          liked={liked}
          onLikeClick={onLikeClick}
          onCommentClick={onCommentClick}
          likeDisabled={likeDisabled}
        />
      </footer>
    );
  }

  return (
    <footer className="mt-12 pt-8 border-t border-neutral-200">
      <div className="flex flex-wrap gap-2">
        {tags.map((label) => (
          <span
            key={label}
            className="rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-sm text-neutral-700"
          >
            {label}
          </span>
        ))}
      </div>
      <div className="mt-4">
        <BlogPostActionButtons
          clapCount={clapCount}
          commentCount={commentCount}
          liked={liked}
          onLikeClick={onLikeClick}
          onCommentClick={onCommentClick}
          likeDisabled={likeDisabled}
        />
      </div>
    </footer>
  );
}
