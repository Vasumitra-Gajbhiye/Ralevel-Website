"use client";

import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { resolveInitialContent } from "./resolveInitialContent";

type BlockNoteViewerProps = {
  initialContent?: unknown;
};

export default function BlockNoteViewer({
  initialContent,
}: BlockNoteViewerProps) {
  const resolved = resolveInitialContent(initialContent);
  const editor = useCreateBlockNote(
    resolved ? { initialContent: resolved } : {},
  );

  return <BlockNoteView editor={editor} editable={false} />;
}
