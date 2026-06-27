"use client";

import BlogRecommendationCard from "@/components/blogs-v2/BlogRecommendationCard";
import type { BlogRecommendation } from "@/components/blogs-v2/dummyBlogRecommendations";
import {
  DUMMY_AUTHOR_RECOMMENDATIONS,
  DUMMY_RALEVEL_RECOMMENDATIONS,
} from "@/components/blogs-v2/dummyBlogRecommendations";

function RecommendationSection({
  title,
  items,
  footerLabel,
}: {
  title: string;
  items: BlogRecommendation[];
  footerLabel: string;
}) {
  return (
    <section className="mt-16 pt-10 border-t border-neutral-200 not-prose">
      <h2 className="text-xl font-bold text-black mb-8">{title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
        {items.map((item) => (
          <BlogRecommendationCard key={item.id} item={item} />
        ))}
      </div>

      <div className="mt-10 pt-8 border-t border-neutral-200 flex justify-center">
        <button
          type="button"
          className="rounded-full border border-neutral-800 px-6 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
        >
          {footerLabel}
        </button>
      </div>
    </section>
  );
}

type BlogPostRecommendationsProps = {
  authorName?: string;
};

export default function BlogPostRecommendations({
  authorName = "Author",
}: BlogPostRecommendationsProps) {
  const displayAuthor = authorName.trim() || "Author";

  const authorItems = DUMMY_AUTHOR_RECOMMENDATIONS.map((item) => ({
    ...item,
    author: displayAuthor,
  }));

  return (
    <>
      <RecommendationSection
        title={`More from ${displayAuthor}`}
        items={authorItems}
        footerLabel={`See all from ${displayAuthor}`}
      />
      <RecommendationSection
        title="More from r/alevel"
        items={DUMMY_RALEVEL_RECOMMENDATIONS}
        footerLabel="More recommendations"
      />
    </>
  );
}
