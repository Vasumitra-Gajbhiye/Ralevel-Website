"use client";

import { useState } from "react";

export default function ExpandableMistakes({
  children,
  size = 220,
}: {
  children: React.ReactNode;
  size?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      {/* THIS wrapper controls positioning */}
      <div className="relative">
        <div
          className="overflow-hidden transition-all duration-500"
          style={!expanded ? { maxHeight: `${size}px` } : {}}
        >
          {children}
        </div>

        {/* Fade INSIDE same relative container */}
        {!expanded && (
          <div className="pointer-events-none absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent" />
        )}
      </div>

      {/* Button OUTSIDE */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="mt-4 flex justify-center items-center text-sm text-muted-foreground hover:text-black transition w-full"
      >
        {expanded ? "↑ Show less" : "↓ Show all mistakes"}
      </button>
    </div>
  );
}
