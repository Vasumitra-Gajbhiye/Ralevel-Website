"use client";

import dynamic from "next/dynamic";

export const BlockNoteEditor = dynamic(
  () => import("./BlockNoteEditor"),
  { ssr: false },
);

export const BlockNoteViewer = dynamic(
  () => import("./BlockNoteViewer"),
  { ssr: false },
);
