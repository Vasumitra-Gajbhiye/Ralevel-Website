"use client";

import { cldImage } from "@/lib/cloudinary";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import posthog from "posthog-js";
import { useEffect, useState } from "react";
import BlogGrid from "./LatestBlogs";

export default function BlogsClient({ data }: { data: any[] }) {
  const featuredIds = [
    "create-an-effective-timetable",
    "mastering-focus-and-avoid-procrastination",
    "boost-productivity-pomodoro-and-other-techniques",
    "tackling-difficult-questions-in-exam",
  ];

  const featuredBlogs = data.filter((b) => featuredIds.includes(b.slug));

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (isHovered || featuredBlogs.length === 0) return;
    const interval = setInterval(() => handleNext(), 4000);
    return () => clearInterval(interval);
  }, [featuredBlogs, isHovered]);

  const handleNext = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % featuredBlogs.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrent(
      (prev) => (prev - 1 + featuredBlogs.length) % featuredBlogs.length
    );
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 100 : -100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -100 : 100, opacity: 0 }),
  };

  return (
    <main className="min-h-screen bg-white text-gray-800">
      {/* HERO + FEATURED combined gradient section */}
      <section className="relative bg-gradient-to-b from-[#eaf5ff] via-[#f9fbff] to-white">
        {/* Hero Section - scaled down */}
        <div className="text-center py-16 px-6 md:px-10">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-sky-800"
          >
            Explore. Learn. Grow.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-gray-600 mt-3 max-w-2xl mx-auto text-base md:text-lg"
          >
            Insightful articles and guides written by the r/alevel community —
            made to help you study smarter and live better.
          </motion.p>
        </div>

        {/* FEATURED SECTION */}
        <div className="relative py-4 px-6 md:px-10">
          <div className="max-w-5xl mx-auto text-center relative">
            <AnimatePresence mode="wait" custom={direction}>
              {featuredBlogs.length > 0 && (
                <motion.div
                  key={featuredBlogs[current]._id}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 150, damping: 25 },
                    opacity: { duration: 0.3 },
                  }}
                  className="relative"
                >
                  {/* Image + arrows container */}
                  <div
                    className="relative inline-block"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    <a
                      href={`/blogs/${featuredBlogs[current].slug}`}
                      className="block rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all mx-auto max-w-4xl"
                      onClick={() =>
                        posthog.capture("blog_post_clicked", {
                          blog_slug: featuredBlogs[current].slug,
                          blog_title: featuredBlogs[current].mainTitle,
                          source: "featured",
                        })
                      }
                    >
                      <Image
                        src={cldImage(
                          `blogs/${featuredBlogs[current]._id}/mainImgThumb.jpg`
                        )}
                        alt={featuredBlogs[current].mainTitle}
                        width={1200}
                        height={600}
                        className="object-cover w-full max-xxs:h-[140px] max-xs:h-[220px] max-sm:h-[270px] max-md:h-[350px] h-[480px] transition-transform duration-700 hover:scale-[1.03]"
                      />
                    </a>

                    {/* SIDE Arrows */}
                    <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                      <button
                        onClick={handlePrev}
                        className="pointer-events-auto bg-white/80 border border-gray-200 hover:border-sky-400 text-sky-700 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shadow-sm hover:shadow-md transition"
                      >
                        <span className="text-2xl md:text-3xl font-light">
                          ‹
                        </span>
                      </button>
                      <button
                        onClick={handleNext}
                        className="pointer-events-auto bg-white/80 border border-gray-200 hover:border-sky-400 text-sky-700 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shadow-sm hover:shadow-md transition"
                      >
                        <span className="text-2xl md:text-3xl font-light">
                          ›
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Text below image */}
                  <div className="mt-8">
                    <p className="uppercase text-sm font-medium tracking-widest text-sky-600 mb-2">
                      {featuredBlogs[current].tag}
                    </p>
                    <h2 className="text-2xl md:text-3xl font-serif font-bold leading-tight mb-3 text-sky-900">
                      <a
                        href={`/blogs/${featuredBlogs[current].slug}`}
                        className="hover:text-sky-700 transition-colors"
                        onClick={() =>
                          posthog.capture("blog_post_clicked", {
                            blog_slug: featuredBlogs[current].slug,
                            blog_title: featuredBlogs[current].mainTitle,
                            source: "featured_title",
                          })
                        }
                      >
                        {featuredBlogs[current].mainTitle}
                      </a>
                    </h2>
                    <p className="text-gray-600 mb-4 max-w-2xl mx-auto text-sm md:text-base">
                      {featuredBlogs[current].subtitle ||
                        "A featured piece from the r/alevel community exploring something worth reading."}
                    </p>
                    <p className="text-sm text-gray-500">
                      {featuredBlogs[current].date} • by{" "}
                      <span className="text-sky-700 font-medium">
                        {featuredBlogs[current].author}
                      </span>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dots */}
            <div className="flex justify-center space-x-2 mt-8">
              {featuredBlogs.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > current ? 1 : -1);
                    setCurrent(i);
                  }}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i === current
                      ? "bg-sky-700 scale-125"
                      : "bg-gray-300 hover:bg-sky-400"
                  }`}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LATEST ARTICLES */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 mt-24 mb-32">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-semibold border-l-4 border-sky-600 pl-3">
            Latest Articles
          </h2>
          {data.length > 8 && (
            <button
              onClick={() => {
                const next = !showAll;
                setShowAll(next);
                posthog.capture("blog_show_all_clicked", {
                  action: next ? "view_all" : "show_less",
                  total_blogs: data.length,
                });
              }}
              className="text-sky-700 hover:text-sky-900 font-medium text-sm border border-sky-200 px-4 py-1.5 rounded-full hover:border-sky-400 transition"
            >
              {showAll ? "Show Less" : "View All"}
            </button>
          )}
        </div>

        <BlogGrid
          blogs={data
            .filter((b) => !featuredIds.includes(b.slug))
            .slice(0, showAll ? data.length : 8)}
        />
      </section>
    </main>
  );
}
