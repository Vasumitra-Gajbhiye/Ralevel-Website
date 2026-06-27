"use client";

import AuthorAvatar from "@/components/blogs-v2/AuthorAvatar";
import BlogPostActionButtons from "@/components/blogs-v2/BlogPostActionButtons";
import { resolveBlogShareUrl } from "@/lib/blogs-v2/share";

type BlogPostHeaderProps = {
  title: string;
  onTitleChange?: (value: string) => void;
  description?: string;
  onDescriptionChange?: (value: string) => void;
  author?: string;
  authorAvatar?: string;
  displayDate?: string;
  readTimeMinutes?: number;
  showActionBar?: boolean;
  clapCount?: number;
  commentCount?: number;
  liked?: boolean;
  onLikeClick?: () => void;
  onCommentClick?: () => void;
  likeDisabled?: boolean;
  shareLive?: boolean;
  publicSlug?: string | null;
};

export default function BlogPostHeader({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  author,
  authorAvatar,
  displayDate,
  readTimeMinutes,
  showActionBar = true,
  clapCount = 0,
  commentCount = 0,
  liked = false,
  onLikeClick,
  onCommentClick,
  likeDisabled = false,
  shareLive = false,
  publicSlug,
}: BlogPostHeaderProps) {
  const editable = Boolean(onTitleChange);
  const authorName = author?.trim() || "Author";
  const shareUrl = resolveBlogShareUrl(publicSlug, shareLive);

  const metaParts: string[] = [];
  if (readTimeMinutes && readTimeMinutes > 0) {
    metaParts.push(`${readTimeMinutes} min read`);
  }
  if (displayDate) {
    metaParts.push(displayDate);
  }
  const metaLine = metaParts.join(" · ");

  return (
    <header className="w-full text-left">
      {editable ? (
        <input
          value={title}
          onChange={(e) => onTitleChange?.(e.target.value)}
          placeholder="Title"
          className="w-full text-3xl md:text-4xl font-bold leading-tight text-black placeholder:text-neutral-300 border-none outline-none bg-transparent"
        />
      ) : (
        <h1 className="text-3xl md:text-4xl font-bold leading-tight text-black">
          {title}
        </h1>
      )}

      {(editable || description) &&
        (editable ? (
          <textarea
            value={description ?? ""}
            onChange={(e) => onDescriptionChange?.(e.target.value)}
            placeholder="Add a short description…"
            rows={2}
            className="mt-4 w-full resize-none text-lg text-neutral-600 placeholder:text-neutral-300 border-none outline-none bg-transparent leading-relaxed"
          />
        ) : (
          description && (
            <p className="mt-4 text-lg text-neutral-600 leading-relaxed">
              {description}
            </p>
          )
        ))}

      <div className="mt-8 border-y border-neutral-200 py-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <AuthorAvatar
              author={authorName}
              src={authorAvatar}
              useUiAvatarsFallback={!authorAvatar?.trim()}
            />
            <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
              <span className="text-sm font-medium text-black">
                {authorName}
              </span>
              {metaLine && (
                <span className="text-sm text-neutral-500">{metaLine}</span>
              )}
            </div>
          </div>

          {showActionBar && (
            <BlogPostActionButtons
              clapCount={clapCount}
              commentCount={commentCount}
              liked={liked}
              onLikeClick={onLikeClick}
              onCommentClick={onCommentClick}
              likeDisabled={likeDisabled}
              shareUrl={shareUrl}
              shareLive={shareLive}
              shareTitle={title}
            />
          )}
        </div>
      </div>
    </header>
  );
}
