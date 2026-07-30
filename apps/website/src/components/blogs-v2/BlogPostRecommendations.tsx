"use client";

import BlogRecommendationCard from "@/components/blogs-v2/BlogRecommendationCard";
import type { BlogRecommendationItem } from "@/lib/blogs-v2/recommendations";
import Link from "next/link";

function RecommendationSection({
  title,
  items,
  footerLabel,
  footerHref,
}: {
  title: string;
  items: BlogRecommendationItem[];
  footerLabel: string;
  footerHref: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="mt-16 pt-10 border-t border-neutral-200 not-prose">
      <h2 className="text-xl font-bold text-black mb-8">{title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
        {items.map((item) => (
          <BlogRecommendationCard key={item.slug} item={item} />
        ))}
      </div>

      <div className="mt-10 pt-8 border-t border-neutral-200 flex justify-center">
        <Link
          href={footerHref}
          className="rounded-full border border-neutral-800 px-6 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
        >
          {footerLabel}
        </Link>
      </div>
    </section>
  );
}

type BlogPostRecommendationsProps = {
  authorItems: BlogRecommendationItem[];
  siteItems: BlogRecommendationItem[];
  authorSlug?: string;
  authorName: string;
};

export default function BlogPostRecommendations({
  authorItems,
  siteItems,
  authorSlug,
  authorName,
}: BlogPostRecommendationsProps) {
  const displayAuthor = authorName.trim() || "Author";

  return (
    <>
      {authorItems.length > 0 && (
        <RecommendationSection
          title={`More from ${displayAuthor}`}
          items={authorItems}
          footerLabel={`See all from ${displayAuthor}`}
          footerHref={authorSlug ? `/author/${authorSlug}` : "/author"}
        />
      )}
      <RecommendationSection
        title="More from r/alevel"
        items={siteItems}
        footerLabel="More recommendations"
        footerHref="/blogs"
      />
    </>
  );
}
