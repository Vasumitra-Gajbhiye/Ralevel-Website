"use client";

import AuthorAvatar from "@/components/blogs-v2/AuthorAvatar";

type BlogPostAuthorProfileProps = {
  author?: string;
  authorBio?: string;
  authorFollowers?: number;
};

export default function BlogPostAuthorProfile({
  author,
  authorBio,
  authorFollowers,
}: BlogPostAuthorProfileProps) {
  const authorName = author?.trim();
  if (!authorName && !authorBio?.trim()) return null;

  const displayName = authorName || "Author";
  const followers = authorFollowers ?? 0;

  return (
    <section className="mt-12 flex gap-4">
      <AuthorAvatar author={displayName} className="h-12 w-12" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-bold text-black">
              Written by {displayName}
            </p>
            <p className="mt-0.5 text-sm text-neutral-500">
              {followers} {followers === 1 ? "follower" : "followers"}
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-full border border-neutral-800 px-4 py-1 text-sm font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
            onClick={() => {}}
          >
            Follow
          </button>
        </div>
        {authorBio?.trim() && (
          <p className="mt-4 text-base leading-relaxed text-black">
            {authorBio}
          </p>
        )}
      </div>
    </section>
  );
}
