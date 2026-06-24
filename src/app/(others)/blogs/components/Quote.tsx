import React from "react";

export default function Quote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-8  border-l-4 border-sky-400 pl-4 py-4 italic bg-sky-50 rounded text-sky-900/80 text-md leading-snug">
      {children}
    </blockquote>
  );
}