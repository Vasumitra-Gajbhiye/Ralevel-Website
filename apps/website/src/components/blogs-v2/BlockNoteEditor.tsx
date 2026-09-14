"use client";

import "@blocknote/core/fonts/inter.css";
import { filterSuggestionItems } from "@blocknote/core/extensions";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote,
} from "@blocknote/react";
import type { BlockNoteEditor as Editor } from "@blocknote/core";
import { useEffect, useRef } from "react";
import { resolveInitialContent } from "./resolveInitialContent";
import "./blocknote-notion.css";

type BlockNoteEditorProps = {
  initialContent?: unknown;
  onEditorReady?: (editor: Editor) => void;
  onChange?: () => void;
};

const HEADING_ALIASES: Record<string, string[]> = {
  "Heading 1": ["h1", "h", "heading1"],
  "Heading 2": ["h2", "heading2"],
  "Heading 3": ["h3", "heading3"],
};

export default function BlockNoteEditor({
  initialContent,
  onEditorReady,
  onChange,
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

  useEffect(() => {
    if (!onChange) return;
    return editor.onChange(onChange);
  }, [editor, onChange]);

  return (
    <div className="bn-notion-editor">
      <BlockNoteView editor={editor} slashMenu={false} theme="light">
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={async (query) =>
            filterSuggestionItems(
              getDefaultReactSlashMenuItems(editor).map((item) => {
                const extra = HEADING_ALIASES[item.title];
                if (!extra) return item;
                return {
                  ...item,
                  aliases: [...new Set([...(item.aliases ?? []), ...extra])],
                };
              }),
              query,
            )
          }
        />
      </BlockNoteView>
    </div>
  );
}
