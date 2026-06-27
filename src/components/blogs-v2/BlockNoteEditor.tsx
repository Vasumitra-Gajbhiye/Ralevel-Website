"use client";

import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import type { BlockNoteEditor as Editor } from "@blocknote/core";
import { useEffect, useRef } from "react";
import { resolveInitialContent } from "./resolveInitialContent";
import "./blocknote-notion.css";

type BlockNoteEditorProps = {
  initialContent?: unknown;
  onEditorReady?: (editor: Editor) => void;
};

export default function BlockNoteEditor({
  initialContent,
  onEditorReady,
}: BlockNoteEditorProps) {
  const resolved = resolveInitialContent(initialContent);
  const editor = useCreateBlockNote(
    resolved ? { initialContent: resolved } : {},
  );

  const readyRef = useRef(false);

  useEffect(() => {
    if (!readyRef.current && onEditorReady) {
      readyRef.current = true;
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  return (
    <div className="bn-notion-editor">
      <BlockNoteView editor={editor} theme="light" />
    </div>
  );
}
