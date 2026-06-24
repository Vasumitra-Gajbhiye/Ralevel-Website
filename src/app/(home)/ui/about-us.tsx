"use client";

import { motion, useAnimation, Variants } from "framer-motion";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export default function AboutUs() {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.65,
  });

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [inView, controls]);

  // Parent container handles stagger timing
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25, // each child delayed slightly
        delayChildren: 0.1,
      },
    },
  };

  // Each child animation
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut", // smoother built-in easing
      },
    },
  };

  return (
    <motion.section
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={controls}
      className="flex flex-col gap-6 px-8 md:px-16 mb-52 mt-24 text-left tracking-wide xs:tracking-widest mx-auto max-w-5xl"
    >
      {/* Heading */}
      <motion.div variants={itemVariants}>
        <h1 className="font-extrabold text-5xl text-gray-900">About Us</h1>
      </motion.div>

      {/* Subheading */}
      <motion.div variants={itemVariants}>
        <h4 className="text-xl text-blue-600 tracking-widest">OUR JOURNEY</h4>
        <h2 className="md:text-2xl text-xl font-bold mt-1 text-gray-800">
          From Small Beginning to Reddit’s Largest A Level Community
        </h2>
      </motion.div>

      {/* Paragraph */}
      <motion.div variants={itemVariants}>
        <p className="md:w-3/4 text-gray-700 leading-relaxed">
          On 5th April 2013,{" "}
          <span className="font-semibold text-blue-600">r/alevel</span> started
          as a tiny subreddit where A Level students could connect and help each
          other out. Fast forward to today, and we’ve become the{" "}
          <span className="font-semibold text-blue-600">
            biggest A Level community
          </span>{" "}
          on Reddit.
          <br />
          <br />
          Our discussions, study tips, and resource sharing have supported
          thousands of students. We launched our{" "}
          <span className="font-semibold text-blue-600">Discord server</span> on
          11th June 2023, and it has over 40,000 members — all working together
          to ace those A Levels.
          <br />
          <br />
          Join us on this incredible journey!
        </p>
      </motion.div>
    </motion.section>
  );
}
