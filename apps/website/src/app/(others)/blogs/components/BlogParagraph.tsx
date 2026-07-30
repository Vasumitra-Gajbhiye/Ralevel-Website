"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function BlogParagraph({ children }: { children: ReactNode }) {
  let i = 1;
  return (
    <motion.section
      key={i + 1}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: i * 0.1 }}
      viewport={{ once: true }}
    >
      <p className="my-5 leading-8 tracking-wide text-[1.02rem] text-slate-700">
        {children}
      </p>
    </motion.section>
  );
}
