"use client";

import { Button } from "@/components/ui/button";
import { commentBodyPlainLength, sanitizeCommentBody } from "@/lib/sanitizeCommentBody";
import { cn } from "@/lib/utils";
import { Bold, Italic } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type CommentRichTextEditorProps = {
  userName?: string;
  placeholder?: string;
  submitLabel?: string;
  compact?: boolean;
  autoFocus?: boolean;
  onSubmit: (body: string) => Promise<void> | void;
  onCancel?: () => void;
};

function serializeNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();
  const childText = Array.from(el.childNodes).map(serializeNode).join("");

  if (tag === "br") return "\n";
  if (tag === "strong" || tag === "b") return `**${childText}**`;
  if (tag === "em" || tag === "i") return `*${childText}*`;
  if (tag === "div" || tag === "p") {
    const inner = Array.from(el.childNodes).map(serializeNode).join("");
    return inner.endsWith("\n") ? inner : `${inner}\n`;
  }

  return childText;
}

function serializeEditor(root: HTMLElement): string {
  return sanitizeCommentBody(
    Array.from(root.childNodes).map(serializeNode).join("").replace(/\n+$/, ""),
  );
}

function getPlainText(root: HTMLElement): string {
  return root.innerText.replace(/\u00a0/g, " ").trim();
}

export default function CommentRichTextEditor({
  userName,
  placeholder = "What are your thoughts?",
  submitLabel = "Respond",
  compact = false,
  autoFocus = false,
  onSubmit,
  onCancel,
}: CommentRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(compact || autoFocus);
  const [submitting, setSubmitting] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  const syncHasContent = useCallback(() => {
    const el = editorRef.current;
    if (!el) {
      setHasContent(false);
      return;
    }
    const plain = getPlainText(el);
    setHasContent(plain.length > 0);
  }, []);

  useEffect(() => {
    if (autoFocus && editorRef.current) {
      editorRef.current.focus();
    }
  }, [autoFocus, expanded]);

  function handleBold(e: React.MouseEvent) {
    e.stopPropagation();
    editorRef.current?.focus();
    document.execCommand("bold");
    syncHasContent();
  }

  function handleItalic(e: React.MouseEvent) {
    e.stopPropagation();
    editorRef.current?.focus();
    document.execCommand("italic");
    syncHasContent();
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    syncHasContent();
  }

  function handleCancel(e: React.MouseEvent) {
    e.stopPropagation();
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
    setHasContent(false);
    if (!compact) {
      setExpanded(false);
    }
    onCancel?.();
  }

  async function handleSubmit(e: React.MouseEvent) {
    e.stopPropagation();
    const el = editorRef.current;
    if (!el) return;

    const body = serializeEditor(el);
    if (commentBodyPlainLength(body) === 0) return;

    setSubmitting(true);
    try {
      await onSubmit(body);
      el.innerHTML = "";
      setHasContent(false);
      if (!compact) setExpanded(false);
      onCancel?.();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={compact ? "" : "mt-4"}>
      {!compact && userName && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-black">{userName}</span>
        </div>
      )}

      <div
        className={cn(
          "rounded-lg bg-neutral-100 transition-all duration-300 ease-out",
          expanded ? "p-4" : "px-4 py-3 cursor-text",
        )}
        onClick={() => {
          if (!expanded) setExpanded(true);
        }}
        onKeyDown={(e) => {
          if (!expanded && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setExpanded(true);
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
      >
        {expanded ? (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={syncHasContent}
            onPaste={handlePaste}
            data-placeholder={placeholder}
            className="w-full min-h-[80px] bg-transparent text-base text-black outline-none leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-neutral-400"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <p className="text-neutral-400 text-base">{placeholder}</p>
        )}

        <div
          className={cn(
            "flex items-center justify-between overflow-hidden transition-all duration-300 ease-out",
            expanded ? "mt-3 max-h-12 opacity-100" : "max-h-0 opacity-0 mt-0",
          )}
        >
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-2 text-neutral-500 hover:text-neutral-800 rounded-md hover:bg-neutral-200/60 transition-colors"
              onClick={handleBold}
              aria-label="Bold"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="p-2 text-neutral-500 hover:text-neutral-800 rounded-md hover:bg-neutral-200/60 transition-colors"
              onClick={handleItalic}
              aria-label="Italic"
            >
              <Italic className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="text-sm text-neutral-600 hover:text-neutral-900"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <Button
              type="button"
              size="sm"
              disabled={!hasContent || submitting}
              className="rounded-full px-5"
              onClick={handleSubmit}
            >
              {submitting ? "Posting…" : submitLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
