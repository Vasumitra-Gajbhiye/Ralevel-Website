"use client";

import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}

export default function Reveal({
  children,
  delay = 0,
  direction = "up",
}: RevealProps) {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.15, triggerOnce: true });

  const directionVariants = {
    up: { y: 40, opacity: 0 },
    down: { y: -40, opacity: 0 },
    left: { x: -40, opacity: 0 },
    right: { x: 40, opacity: 0 },
  };

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      transition={{ duration: 0.7, delay }}
      variants={{
        hidden: directionVariants[direction],
        visible: { x: 0, y: 0, opacity: 1 },
      }}
    >
      {children}
    </motion.div>
  );
}