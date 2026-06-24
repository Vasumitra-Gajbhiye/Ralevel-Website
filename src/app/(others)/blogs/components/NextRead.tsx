"use client";
import { motion } from "framer-motion";

export default function NextRead({
  title,
  href,
}: {
  title: string;
  href: string;
}) {
  return (
    <motion.a
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 180, damping: 15 }}
      href={href}
      className="block mt-16 p-6 bg-sky-50 border border-sky-200 rounded-xl shadow-sm text-center"
    >
      <div className="text-sky-700 font-semibold text-sm">Read Next:</div>
      <div className="text-sky-900 text-lg font-bold mt-1">{title}</div>
    </motion.a>
  );
}