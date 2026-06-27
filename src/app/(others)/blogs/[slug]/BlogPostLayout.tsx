"use client";

import BlogLikeSignInDialog from "@/components/blogs-v2/BlogLikeSignInDialog";
import BlogPostAuthorProfile from "@/components/blogs-v2/BlogPostAuthorProfile";
import BlogPostComments from "@/components/blogs-v2/BlogPostComments";
import BlogPostRecommendations from "@/components/blogs-v2/BlogPostRecommendations";
import BlogPostFooter from "@/components/blogs-v2/BlogPostFooter";
import BlogPostHeader from "@/components/blogs-v2/BlogPostHeader";
import BlogHeroPlaceholder from "@/components/blogs-v2/BlogHeroPlaceholder";
import { hasBlogHeroImage, isExternalImageUrl, resolveBlogHeroImage } from "@/lib/blogHeroImage";

import { useUser } from "@clerk/nextjs";
import { motion, useScroll, useSpring } from "framer-motion";
import Image from "next/image";
import posthog from "posthog-js";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type BlogPostLayoutProps = {
  metadata: {
    title?: string;
    author?: string;
    date?: string;
    tag?: string;
    image?: string;
    description?: string;
    readTimeMinutes?: number;
    authorBio?: string;
    authorFollowers?: number;
    authorAvatar?: string;
  };
  children: React.ReactNode;
  showToc?: boolean;
  showComments?: boolean;
  blogSlug?: string;
  initialLikeCount?: number;
  initialLiked?: boolean;
  initialCommentCount?: number;
  currentUserName?: string;
  currentUserId?: string;
  isAdmin?: boolean;
};

function isValidImageSrc(src?: string) {
  if (!src) return false;

  if (src.startsWith("/")) return true;

  try {
    const url = new URL(src);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function BlogPostLayout({
  metadata,
  children,
  showToc = true,
  showComments = false,
  blogSlug,
  initialLikeCount = 0,
  initialLiked = false,
  initialCommentCount = 0,
  currentUserName,
  currentUserId,
  isAdmin = false,
}: BlogPostLayoutProps) {
  const { isSignedIn } = useUser();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const [activeHeading, setActiveHeading] = useState("");
  const [toc, setToc] = useState<{ id: string; text: string }[]>([]);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [liked, setLiked] = useState(initialLiked);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const [signInDialogOpen, setSignInDialogOpen] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    posthog.capture("blog_post_viewed", {
      blog_title: metadata.title,
      blog_author: metadata.author,
      blog_date: metadata.date,
    });
  }, []);

  useEffect(() => {
    setLikeCount(initialLikeCount);
    setLiked(initialLiked);
    setCommentCount(initialCommentCount);
  }, [initialLikeCount, initialLiked, initialCommentCount, blogSlug]);

  const scrollToComments = useCallback(() => {
    document.getElementById("blog-comments")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const handleLikeClick = useCallback(async () => {
    if (!blogSlug) return;

    if (!isSignedIn) {
      setSignInDialogOpen(true);
      return;
    }

    const previousLiked = liked;
    const previousCount = likeCount;
    const nextLiked = !liked;
    const nextCount = nextLiked ? likeCount + 1 : Math.max(0, likeCount - 1);

    setLiked(nextLiked);
    setLikeCount(nextCount);

    try {
      const res = await fetch(`/api/blogs/v2/${blogSlug}/like`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to update like");
      }

      const data = (await res.json()) as { liked: boolean; likeCount: number };
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch {
      setLiked(previousLiked);
      setLikeCount(previousCount);
      toast.error("Could not update like. Please try again.");
    }
  }, [blogSlug, isSignedIn, liked, likeCount]);

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll("h2"));

    const tocItems = headings.map((el, index) => {
      const text = el.textContent || "";
      const baseId = text.toLowerCase().replace(/\s+/g, "-");
      const id = `${baseId}-${index}`;
      el.setAttribute("id", id);
      return { id, text };
    });

    setToc(tocItems);

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            if (!id) return;
            const match = tocItems.find((t) => t.id === id);
            if (match) setActiveHeading(match.id);
          }
        }),
      { rootMargin: "0px 0px -60% 0px" },
    );

    headings.forEach((h) => observer.observe(h));

    return () => observer.disconnect();
  }, []);

  const trimmedImage = metadata.image?.trim() ?? "";
  const hasImageInput = hasBlogHeroImage(trimmedImage);
  const imageIsValid = isValidImageSrc(trimmedImage);

  const heroImageSrc =
    hasImageInput && imageIsValid
      ? resolveBlogHeroImage(trimmedImage)
      : hasImageInput
        ? "/opengraph-image-2.png"
        : null;

  return (
    <>
      <BlogLikeSignInDialog
        open={signInDialogOpen}
        onOpenChange={setSignInDialogOpen}
      />

      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-sky-700 origin-left z-50"
        style={{ scaleX }}
      />

      <div
        ref={ref}
        className="relative flex flex-col items-center my-16 md:my-20 px-5 md:px-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-3xl"
        >
          <BlogPostHeader
            title={metadata.title ?? "Untitled"}
            description={metadata.description}
            author={metadata.author}
            authorAvatar={metadata.authorAvatar}
            displayDate={metadata.date}
            readTimeMinutes={metadata.readTimeMinutes}
            clapCount={likeCount}
            commentCount={commentCount}
            liked={liked}
            onLikeClick={blogSlug ? handleLikeClick : undefined}
            onCommentClick={showComments ? scrollToComments : undefined}
          />

          <div className="mt-10 rounded-2xl overflow-hidden shadow-md aspect-[2/1] w-full">
            {heroImageSrc ? (
              <Image
                src={heroImageSrc}
                alt="blog hero"
                width={1200}
                height={600}
                unoptimized={isExternalImageUrl(heroImageSrc)}
                className={`object-cover h-full w-full ${
                  imageIsValid ? "" : "opacity-60"
                }`}
                priority
              />
            ) : (
              <BlogHeroPlaceholder />
            )}
          </div>
        </motion.div>

        {showToc && toc.length > 1 && (
          <motion.aside
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="hidden xl:block fixed right-16 top-1/3 w-60 text-sm z-40"
          >
            <div className="p-4 bg-white/60 backdrop-blur-md border border-sky-100/60 rounded-2xl shadow-md">
              <h3 className="font-semibold text-gray-700 mb-3">On this page</h3>
              <ul className="space-y-2 text-gray-600">
                {toc.map(({ id, text }) => (
                  <li
                    key={id}
                    className={`cursor-pointer relative pl-2 transition-all ${
                      activeHeading === id
                        ? "text-sky-600 font-medium before:absolute before:left-0 before:top-[5px] before:h-4 before:w-[3px] before:bg-sky-500 rounded-full"
                        : "hover:text-sky-700 hover:translate-x-1"
                    }`}
                    onClick={() =>
                      document.getElementById(id)?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      })
                    }
                  >
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </motion.aside>
        )}

        <div className="w-full max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-10 leading-8 text-slate-800 tracking-wide prose prose-sky prose-lg max-w-none"
          >
            {children}
            <BlogPostFooter
              tag={metadata.tag}
              clapCount={likeCount}
              commentCount={commentCount}
              liked={liked}
              onLikeClick={blogSlug ? handleLikeClick : undefined}
              onCommentClick={showComments ? scrollToComments : undefined}
            />
            <BlogPostAuthorProfile
              author={metadata.author}
              authorAvatar={metadata.authorAvatar}
              authorBio={metadata.authorBio}
              authorFollowers={metadata.authorFollowers}
            />
            {showComments && blogSlug && (
              <>
                <BlogPostComments
                  blogSlug={blogSlug}
                  currentUserName={
                    currentUserName ??
                    (isSignedIn ? "Reader" : "Guest reader")
                  }
                  currentUserId={currentUserId}
                  isSignedIn={Boolean(isSignedIn)}
                  isAdmin={isAdmin}
                  initialTotalCount={commentCount}
                  onCommentCountChange={setCommentCount}
                />
                <BlogPostRecommendations
                  authorName={metadata.author}
                />
              </>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
