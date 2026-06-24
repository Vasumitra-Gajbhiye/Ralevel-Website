"use client";
import { cldImage } from "@/lib/cloudinary";

import { motion, useScroll, useSpring } from "framer-motion";
import Image from "next/image";
import posthog from "posthog-js";
import { useEffect, useRef, useState } from "react";

type BlogPostLayoutProps = {
  metadata: any;
  children: React.ReactNode;
  showToc?: boolean; // 👈 NEW
};
function isValidImageSrc(src?: string) {
  if (!src) return false;

  // ✅ internal public asset
  if (src.startsWith("/")) return true;

  // ✅ external URL
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
  showToc = true, // 👈 default ON for real blogs
}: BlogPostLayoutProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const [activeHeading, setActiveHeading] = useState("");
  const [toc, setToc] = useState<{ id: string; text: string }[]>([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    posthog.capture("blog_post_viewed", {
      blog_title: metadata.title,
      blog_author: metadata.author,
      blog_date: metadata.date,
    });
  }, []);

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll("h2"));

    const tocItems = headings.map((el, index) => {
      const text = el.textContent || "";
      const baseId = text.toLowerCase().replace(/\s+/g, "-");

      // 👇 ensures uniqueness even with duplicate headings
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
      { rootMargin: "0px 0px -60% 0px" }
    );

    headings.forEach((h) => observer.observe(h));

    return () => observer.disconnect();
  }, []);

  const hasImageInput = Boolean(metadata.image?.trim());
  const imageIsValid = isValidImageSrc(metadata.image);

  const heroImageSrc = hasImageInput
    ? imageIsValid
      ? metadata.image
      : "/opengraph-image-2.png"
    : null;

  return (
    <>
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-sky-700 origin-left z-50"
        style={{ scaleX }}
      />

      <div
        ref={ref}
        className="relative flex flex-col items-center my-20 px-5 md:px-10"
      >
        {/* HERO (shared width) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-3xl text-center"
        >
          <h1 className="max-xxs:text-xl max-xs:text-2xl max-md:text-3xl text-4xl font-extrabold leading-snug text-black">
            {metadata.title}
          </h1>

          <div className="mt-3 text-sm text-gray-500">
            <span>{metadata.date}</span> ·{" "}
            <span className="text-blue-600 font-medium">{metadata.author}</span>
          </div>
          {console.log(heroImageSrc)}
          {heroImageSrc && (
            <div className="mt-8 rounded-2xl overflow-hidden shadow-md">
              <Image
                src={cldImage(heroImageSrc)}
                alt="blog hero"
                width={1200}
                height={600}
                className={`object-cover w-full ${
                  imageIsValid ? "" : "opacity-60"
                }`}
                priority
              />
            </div>
          )}
        </motion.div>

        {/* FLOATING TOC (fixed) */}
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

        {/* CONTENT (wrap fixes the width; prose disables its own max-width) */}
        <div className="w-full max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-14 leading-8 text-slate-800 tracking-wide prose prose-sky prose-lg max-w-none"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </>
  );
}
