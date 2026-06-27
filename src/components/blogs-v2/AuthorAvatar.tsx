"use client";

import { getAuthorAvatarUrl } from "@/lib/authorAvatar";
import { resolveWriterAvatar } from "@/lib/resolveWriterAvatar";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function GreyAvatarPlaceholder() {
  return (
    <svg
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      aria-hidden
    >
      <circle cx="22" cy="22" r="22" fill="#E5E5E5" />
      <circle cx="22" cy="17" r="7" fill="#A3A3A3" />
      <path d="M8 38c2.5-7 8-11 14-11s11.5 4 14 11" fill="#A3A3A3" />
    </svg>
  );
}

type AuthorAvatarProps = {
  author: string;
  src?: string;
  className?: string;
  useUiAvatarsFallback?: boolean;
};

export default function AuthorAvatar({
  author,
  src,
  className,
  useUiAvatarsFallback = true,
}: AuthorAvatarProps) {
  const [failed, setFailed] = useState(false);

  const trimmedSrc = src?.trim();
  const resolvedSrc = trimmedSrc ? resolveWriterAvatar(trimmedSrc) : undefined;
  const fallbackUrl = useUiAvatarsFallback ? getAuthorAvatarUrl(author) : undefined;
  const avatarUrl = resolvedSrc ?? fallbackUrl;

  const showPlaceholder = !avatarUrl || failed;

  return (
    <div
      className={cn(
        "relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-neutral-200",
        className,
      )}
    >
      {showPlaceholder ? (
        <GreyAvatarPlaceholder />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={author}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
