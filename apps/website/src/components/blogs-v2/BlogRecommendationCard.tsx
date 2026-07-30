"use client";

import AuthorAvatar from "@/components/blogs-v2/AuthorAvatar";
import { hasBlogHeroImage, isExternalImageUrl, resolveBlogHeroImage } from "@/lib/blogHeroImage";
import type { BlogRecommendationItem } from "@/lib/blogs-v2/recommendations";
import { MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
  item: BlogRecommendationItem;
}) {
  const href = `/blogs/v2/${item.slug}`;
  const hasImage = hasBlogHeroImage(item.image);
  const imageSrc = hasImage ? resolveBlogHeroImage(item.image!) : null;

  return (
    <article className="flex flex-col">
      <Link href={href} className="block group">
        {imageSrc ? (
          <div className="relative w-full aspect-[16/10] rounded-sm overflow-hidden bg-neutral-200">
            <Image
              src={imageSrc}
              alt=""
              fill
              unoptimized={isExternalImageUrl(imageSrc)}
              className="object-cover group-hover:opacity-95 transition-opacity"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ) : (
          <div
            className="w-full aspect-[16/10] rounded-sm bg-neutral-200"
            aria-hidden
          />
        )}

        <div className="mt-3 flex items-center gap-2 text-sm text-neutral-600 min-w-0">
          <AuthorAvatar author={item.authorName} className="h-5 w-5" />
          <span className="truncate">
            <span className="text-black">{item.authorName}</span>
            {item.dateLabel && (
              <>
                <span className="text-neutral-400"> · </span>
                <span>{item.dateLabel}</span>
              </>
            )}
          </span>
        </div>

        <h3 className="mt-2 text-lg font-bold leading-snug text-black line-clamp-2 group-hover:underline">
          {item.title}
        </h3>

        {item.description && (
          <p className="mt-2 text-sm leading-relaxed text-neutral-500 line-clamp-2">
            {item.description}
          </p>
        )}
      </Link>

      <div className="mt-4 flex items-center text-neutral-500">
        <div className="flex items-center gap-4 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <ClapIcon className="h-4 w-4" />
            {item.likeCount}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4" />
            {item.commentCount}
          </span>
        </div>
      </div>
    </article>
  );
}
