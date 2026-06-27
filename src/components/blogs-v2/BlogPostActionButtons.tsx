"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart, MessageCircle, Share2 } from "lucide-react";

type BlogPostActionButtonsProps = {
  clapCount?: number;
  commentCount?: number;
  liked?: boolean;
  onLikeClick?: () => void;
  onCommentClick?: () => void;
  likeDisabled?: boolean;
};

export default function BlogPostActionButtons({
  clapCount = 0,
  commentCount = 0,
  liked = false,
  onLikeClick,
  onCommentClick,
  likeDisabled = false,
}: BlogPostActionButtonsProps) {
  return (
    <div className="flex items-center gap-1 md:gap-2 shrink-0">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "h-9 gap-2 px-2",
          liked
            ? "text-red-500 hover:text-red-600"
            : "text-neutral-600 hover:text-neutral-900",
        )}
        onClick={onLikeClick}
        disabled={likeDisabled}
        aria-pressed={liked}
        aria-label={liked ? "Unlike post" : "Like post"}
      >
        <Heart
          className={cn(
            "h-5 w-5",
            liked ? "fill-red-500 stroke-red-500 text-red-500" : "fill-none",
          )}
        />
        <span className="text-sm tabular-nums">{clapCount}</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-9 gap-2 px-2 text-neutral-600 hover:text-neutral-900"
        onClick={onCommentClick}
        aria-label="View comments"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm tabular-nums">{commentCount}</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-9 px-2 text-neutral-600 hover:text-neutral-900"
        onClick={() => {}}
      >
        <Share2 className="h-5 w-5" />
      </Button>
    </div>
  );
}
