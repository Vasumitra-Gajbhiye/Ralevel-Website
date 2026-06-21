// app/(others)/blogs/[slug]/page.tsx
import fs from "fs";
import { notFound } from "next/navigation";
import path from "path";
import { Suspense } from "react";
import BlogPostLayout from "./BlogPostLayout";

export async function generateStaticParams() {
  const postsDir = path.join(process.cwd(), "app/(others)/blogs/posts");

  // Read all filenames in the folder
  const files = fs.readdirSync(postsDir);

  // Filter only `.mdx` files → remove extension → return slug objects
  return files
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => ({
      slug: file.replace(/\.mdx$/, ""),
    }));
}

const baseUrl = "https://ralevel.com";

// ⭐ Pull metadata directly from the MDX file
export async function generateMetadata({ params }: any) {
  const { slug } = await params;

  try {
    const { metadata } = await import(`@/app/(others)/blogs/posts/${slug}.mdx`);

    return {
      title: metadata?.title,
      description: metadata?.description,

      openGraph: {
        title: metadata?.title,
        description: metadata?.description,
        type: "article",
        images: [
          {
            url: baseUrl + metadata?.image,
            width: 2240,
            height: 1260,
            alt: metadata?.title,
          },
        ],
      },

      twitter: {
        card: "summary_large_image",
        title: metadata?.title,
        description: metadata?.description,
        images: [baseUrl + metadata?.image],
      },

      keywords: metadata?.tag ?? [],
      authors: [{ name: "r/alevel" }],
      alternates: {
        canonical: `https://ralevel.com/blogs/${slug}`,
      },
    };
  } catch (e) {
    return {};
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    // const Post = require(`../posts/${params.slug}.mdx`).default;

    const { default: Post } = await import(
      `@/app/(others)/blogs/posts/${slug}.mdx`
    );
    const { metadata } = await import(`@/app/(others)/blogs/posts/${slug}.mdx`);
    // const meta = await generateMetadata(metadata);

    return (
      <Suspense fallback={null}>
        <BlogPostLayout metadata={metadata}>
          <Post />
        </BlogPostLayout>
      </Suspense>
    );
  } catch {
    return notFound();
  }
}
export const revalidate = 3600;
export const dynamicParams = false;
