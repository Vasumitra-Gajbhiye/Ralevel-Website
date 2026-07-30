"use client";

import { useEffect } from "react";

function normalizeVideoUrl(url: string): string {
  if (!url) return url;

  try {
    const u = new URL(url);

    // YouTube watch → embed
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }

    // youtu.be → embed
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }

    return url;
  } catch {
    return url;
  }
}

export default function Video({
  src,
  showInput = false,
  showPreview = true,
  onChange,
}: {
  src: string;
  showInput?: boolean;
  showPreview?: boolean;
  onChange?: (value: string) => void;
}) {
  // Normalize immediately when src changes (editor typing)
  useEffect(() => {
    if (!showInput || !onChange) return;

    const normalized = normalizeVideoUrl(src);
    if (normalized !== src) {
      onChange(normalized);
    }
  }, [src, showInput, onChange]);

  return (
    <div className="my-8 space-y-3">
      {showInput && (
        <input
          type="text"
          placeholder="Paste YouTube / embed link"
          value={src}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      )}

      {showPreview && src && (
        <div className="aspect-video overflow-hidden rounded-xl shadow-sm">
          <iframe
            src={src}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      )}
    </div>
  );
}
