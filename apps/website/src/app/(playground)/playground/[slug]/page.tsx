"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";

/* ================= COMPONENT IMPORTS ================= */

import BlogPostLayout from "../../../(others)/blogs/[slug]/BlogPostLayout";
import BlogHeading from "../../../(others)/blogs/components/BlogHeading";
import BlogImage from "../../../(others)/blogs/components/BlogImage";
import BlogParagraph from "../../../(others)/blogs/components/BlogParagraph";
import Callout from "../../../(others)/blogs/components/Callout";
import Divider from "../../../(others)/blogs/components/Divider";
import Heading3 from "../../../(others)/blogs/components/Heading3";
import KeyPoints from "../../../(others)/blogs/components/KeyPoints";
import KeyPointsMinimal from "../../../(others)/blogs/components/KeyPointsMinimal";
import NextRead from "../../../(others)/blogs/components/NextRead";
import Note from "../../../(others)/blogs/components/Note";
import Quote from "../../../(others)/blogs/components/Quote";
import Video from "../../../(others)/blogs/components/Video";

import SortableBlock from "../SortableBlock";
import SortableKeyPoint from "../SortableKeyPoints";
import { BLOCK_REGISTRY } from "../blockRegistry";

/* ================= DND ================= */

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

/* ================= TYPES ================= */

type EditorBlock =
  | {
      id: string;
      type: "BlogHeading";
      data: { text: string };
    }
  | {
      id: string;
      type: "BlogParagraph";
      data: { text: string };
    }
  | {
      id: string;
      type: "Callout";
      data: {
        variant: "info" | "warn" | "success";
        text: string;
      };
    }
  | {
      id: string;
      type: "BlogImage";
      data: {
        src: string;
        alt: string;
        caption: string;
      };
    }
  | {
      id: string;
      type: "Divider";
      data: {};
    }
  | {
      id: string;
      type: "Heading3";
      data: { text: string };
    }
  | {
      id: string;
      type: "KeyPoints";
      data: {
        items: { id: string; text: string }[];
        color: "emerald" | "sky" | "rose" | "amber" | "violet";
        variant: "check" | "bullet" | "number" | "star" | "minimal";
        title?: string;
      };
    }
  | {
      id: string;
      type: "KeyPointsMinimal";
      data: {
        title?: string;
        ordered?: boolean;
        content: string;
      };
    }
  | {
      id: string;
      type: "Quote";
      data: {
        text: string;
      };
    }
  | {
      id: string;
      type: "Note";
      data: {
        text: string;
      };
    }
  | {
      id: string;
      type: "NextRead";
      data: {
        title: string;
        href: string;
      };
    }
  | {
      id: string;
      type: "Video";
      data: {
        src: string;
      };
    };

type Metadata = {
  title: string;
  author: string;
  date: string;
  tag: string;
  image: string;
};

/* ================= PAGE ================= */
export default function PlaygroundSlugPage() {
  const { slug } = useParams<{ slug: string }>();

  const [loading, setLoading] = useState(true);
  const [metaOpen, setMetaOpen] = useState(true);

  type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

  const prevBlocksRef = useRef<EditorBlock[] | null>(null);

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [dirty, setDirty] = useState(false);

  const [metadata, setMetadata] = useState<Metadata>({
    title: "",
    author: "",
    date: "",
    tag: "",
    image: "",
  });

  const [blocks, setBlocks] = useState<EditorBlock[]>([]);

  /* ================= HYDRATE BLOG ================= */

  useEffect(() => {
    if (saveState !== "dirty") return;

    const timeout = setTimeout(async () => {
      try {
        setSaveState("saving");

        const res = await fetch(`/api/admin/blogs/${slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metadata, blocks }),
        });

        if (!res.ok) throw new Error("Save failed");

        setLastSavedAt(new Date());
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 1200);

    return () => clearTimeout(timeout);
  }, [saveState, metadata, blocks, slug]);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/blogs/${slug}`);
      const blog = await res.json();

      setMetadata(
        blog.metadata ?? {
          title: "New Blog",
          author: "",
          date: "",
          tag: "",
          image: "",
        }
      );

      setBlocks(blog.blocks ?? []);

      setLoading(false);
    }

    load();
  }, [slug]);

  /* ================= AUTOSAVE ================= */
  const didHydrateRef = useRef(false);

  useEffect(() => {
    if (!didHydrateRef.current) {
      didHydrateRef.current = true;
      return;
    }

    setSaveState("dirty");
  }, [blocks, metadata]);
  /* ================= SAFETY NET ================= */

  useEffect(() => {
    if (saveState === "idle" && blocks.length > 0) {
      setSaveState("dirty");
    }
  }, [blocks]);

  /* ================= UNLOAD GUARD ================= */

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  /* ================= HELPERS ================= */

  function formatDate(dateStr: string) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function insertBlockAfter(id: string, newBlock: EditorBlock) {
    setSaveState("dirty");

    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      return [...prev.slice(0, idx + 1), newBlock, ...prev.slice(idx + 1)];
    });
  }

  function deleteBlock(id: string) {
    setSaveState("dirty");
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  function updateBlock(id: string, patch: Partial<any>) {
    setSaveState("dirty");
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === id
          ? ({
              ...b,
              data: { ...(b as any).data, ...patch },
            } as EditorBlock)
          : b
      )
    );
  }
  function setMetadataSafe(next: Metadata) {
    setSaveState("dirty");
    setMetadata(next);
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSaveState("dirty");

    setBlocks((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  }

  // prettier-ignore
  function blocksToMDX(blocks: EditorBlock[]) {
    return blocks
.map((b) => {
if (b.type === "BlogHeading") return `## ${b.data.text}\n`;
if (b.type === "Callout")
  return `<Callout type="${b.data.variant}"> ${b.data.text}</Callout>\n`;
if (b.type === "BlogImage")
  return `<BlogImage src="${b.data.src}" alt="${b.data.alt}" caption="${b.data.caption}"/>`;
if (b.type === "Divider") return `---`;
if (b.type === "Heading3") {
  return `### ${b.data.text}\n`;
}
if (b.type === "KeyPoints") {
  const titleAttr = b.data.title ? ` title="${b.data.title}"` : "";
  return (
`<KeyPoints color="${b.data.color}" variant="${b.data.variant}"${titleAttr}>
${b.data.items.map((item) => `- ${item.text}`).join("\n")}
</KeyPoints>`);
}
        if (b.type === "KeyPointsMinimal") {
          const titleAttr = b.data.title ? ` title="${b.data.title}"` : "";
          const orderedAttr = b.data.ordered ? " ordered" : "";

          return (
`<KeyPointsMinimal${titleAttr}${orderedAttr}>
${b.data.content}
</KeyPointsMinimal>`);
        }
        if (b.type === "Note") {
          return `<Note>${b.data.text}</Note>`;
        }
        if (b.type === "Quote") {
          return `<Quote>${b.data.text}</Quote>`;
        }
        if (b.type === "NextRead") {
          return `<NextRead title="${b.data.title}" href="${b.data.href}" />`;
        }
        if (b.type === "Video") {
          return `<Video src="${b.data.src}" />`;
        }
        return `${b.data.text}\n`;
      })

      .join("\n");
  }

  /* ================= EXPORT  ================= */

  function exportMDX() {
    const mdx = `
export const metadata = {
  title: "${metadata.title}",
  author: "${metadata.author}",
  date: "${metadata.date}",
  tag: "${metadata.tag}",
  image: "${metadata.image}",
};

# ${metadata.title}

${blocksToMDX(blocks)}
`;

    const blob = new Blob([mdx.trim()], { type: "text/mdx" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "post.mdx";
    a.click();
  }

  // Save component
  function SaveIndicator({
    state,
    lastSavedAt,
  }: {
    state: SaveState;
    lastSavedAt: Date | null;
  }) {
    if (state === "saving") {
      return (
        <div className="flex items-center gap-2 text-xs text-blue-600">
          <span className="animate-pulse">●</span>
          <span>Saving…</span>
        </div>
      );
    }

    if (state === "dirty") {
      return (
        <div className="flex items-center gap-2 text-xs text-yellow-600">
          <span>●</span>
          <span>Unsaved changes</span>
        </div>
      );
    }

    if (state === "saved" && lastSavedAt) {
      return (
        <div className="flex items-center gap-2 text-xs text-emerald-600">
          <span>✓</span>
          <span>Saved at {lastSavedAt.toLocaleTimeString()}</span>
        </div>
      );
    }

    if (state === "error") {
      return (
        <div className="flex items-center gap-2 text-xs text-red-600">
          <span>⚠</span>
          <span>Save failed — retrying…</span>
        </div>
      );
    }

    return <div className="text-xs text-gray-400">Not saved yet</div>;
  }

  /* ================= RENDER ================= */

  return (
    <>
      {loading ? (
        <div className="h-screen flex items-center justify-center text-gray-400">
          Loading document…
        </div>
      ) : (
        <div className="h-screen overflow-hidden grid grid-cols-2">
          {/* ================= LEFT: EDITOR ================= */}
          <div className="h-full overflow-y-auto px-8 py-6 scrollbar-minimal">
            <div className="fixed top-4 right-6 z-50">
              <SaveIndicator state={saveState} lastSavedAt={lastSavedAt} />
            </div>
            {/* Metadata */}
            <div className="mb-6 border rounded-lg overflow-hidden">
              <button
                onClick={() => setMetaOpen((v) => !v)}
                className="w-full flex justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100"
              >
                <span className="font-semibold text-sm">Metadata</span>
                <span>{metaOpen ? "−" : "+"}</span>
              </button>

              <AnimatePresence initial={false}>
                {metaOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="px-4 py-4 space-y-3"
                  >
                    <input
                      placeholder="Blog title"
                      value={metadata.title || ""}
                      onChange={(e) =>
                        setMetadataSafe({ ...metadata, title: e.target.value })
                      }
                      className="w-full text-xl font-bold"
                    />

                    <input
                      type="date"
                      onChange={(e) =>
                        setMetadataSafe({
                          ...metadata,
                          date: formatDate(e.target.value),
                        })
                      }
                      className="w-full"
                    />

                    <input
                      placeholder="Author"
                      value={metadata.author || ""}
                      onChange={(e) =>
                        setMetadataSafe({ ...metadata, author: e.target.value })
                      }
                      className="w-full"
                    />

                    <input
                      placeholder="Tag (e.g. Productivity)"
                      value={metadata.tag || ""}
                      onChange={(e) =>
                        setMetadataSafe({ ...metadata, tag: e.target.value })
                      }
                      className="w-full"
                    />

                    <input
                      placeholder="Main thumbnail image URL"
                      value={metadata.image || ""}
                      onChange={(e) =>
                        setMetadataSafe({ ...metadata, image: e.target.value })
                      }
                      className="w-full"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Add blocks */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {BLOCK_REGISTRY.map((b) => (
                <button
                  key={b.type}
                  onClick={() => setBlocks((prev) => [...prev, b.create()])}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded"
                >
                  + {b.label}
                </button>
              ))}
            </div>

            {/* Blocks */}
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                {blocks.map((block) => (
                  <SortableBlock
                    key={block.id}
                    id={block.id}
                    onDelete={() => deleteBlock(block.id)}
                    onAddBelow={(newBlock) =>
                      insertBlockAfter(block.id, newBlock)
                    }
                  >
                    {block.type === "BlogHeading" && (
                      <input
                        value={block.data.text}
                        onChange={(e) =>
                          updateBlock(block.id, { text: e.target.value })
                        }
                        className="w-full text-lg font-semibold border-b"
                      />
                    )}

                    {block.type === "BlogParagraph" && (
                      <textarea
                        value={block.data.text}
                        onChange={(e) =>
                          updateBlock(block.id, { text: e.target.value })
                        }
                        className="w-full border rounded p-2"
                      />
                    )}
                    {block.type === "Callout" && (
                      <div className="border rounded-lg p-3 bg-gray-50 space-y-2">
                        {/* Variant selector */}
                        <select
                          value={block.data.variant}
                          onChange={(e) =>
                            updateBlock(block.id, {
                              variant: e.target.value as any,
                            })
                          }
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="info">Info</option>
                          <option value="warn">Warning</option>
                          <option value="success">Success</option>
                        </select>

                        {/* Callout text */}
                        <textarea
                          value={block.data.text}
                          onChange={(e) =>
                            updateBlock(block.id, { text: e.target.value })
                          }
                          className="w-full border rounded p-2"
                          placeholder="Write callout text..."
                        />
                      </div>
                    )}
                    {block.type === "BlogImage" && (
                      <div className="border rounded-xl p-4 bg-white space-y-3">
                        <div className="text-sm font-medium text-gray-600">
                          Blog Image
                        </div>

                        {/* Image URL */}
                        <input
                          type="text"
                          placeholder="Image URL"
                          value={block.data.src}
                          onChange={(e) =>
                            updateBlock(block.id, { src: e.target.value })
                          }
                          className="w-full border rounded px-3 py-2 text-sm"
                        />

                        {/* Alt text */}
                        <input
                          type="text"
                          placeholder="Alt text (for accessibility)"
                          value={block.data.alt}
                          onChange={(e) =>
                            updateBlock(block.id, { alt: e.target.value })
                          }
                          className="w-full border rounded px-3 py-2 text-sm"
                        />

                        {/* Caption */}
                        <input
                          type="text"
                          placeholder="Caption (optional)"
                          value={block.data.caption ?? ""}
                          onChange={(e) =>
                            updateBlock(block.id, { caption: e.target.value })
                          }
                          className="w-full border rounded px-3 py-2 text-sm"
                        />
                      </div>
                    )}
                    {block.type === "Divider" && (
                      <div className="py-6 flex items-center justify-center text-xs text-gray-400 uppercase tracking-wide">
                        Divider
                      </div>
                    )}
                    {block.type === "Heading3" && (
                      <input
                        value={block.data.text}
                        onChange={(e) =>
                          updateBlock(block.id, { text: e.target.value })
                        }
                        className="w-full text-sm font-semibold border-b"
                      />
                    )}

                    {block.type === "KeyPoints" && (
                      <div className="border rounded-xl p-4 space-y-3">
                        <input
                          placeholder="Optional title"
                          value={block.data.title ?? ""}
                          onChange={(e) =>
                            updateBlock(block.id, { title: e.target.value })
                          }
                          className="w-full border rounded px-3 py-2 text-sm"
                        />

                        <div className="flex gap-2">
                          <select
                            value={block.data.variant}
                            onChange={(e) =>
                              updateBlock(block.id, {
                                variant: e.target.value as any,
                              })
                            }
                            className="border rounded px-2 py-1 text-sm"
                          >
                            <option value="check">Check</option>
                            <option value="bullet">Bullet</option>
                            <option value="number">Number</option>
                            <option value="star">Star</option>
                            <option value="minimal">Minimal</option>
                          </select>

                          <select
                            value={block.data.color}
                            onChange={(e) =>
                              updateBlock(block.id, {
                                color: e.target.value as any,
                              })
                            }
                            className="border rounded px-2 py-1 text-sm"
                          >
                            <option value="emerald">Emerald</option>
                            <option value="sky">Sky</option>
                            <option value="rose">Rose</option>
                            <option value="amber">Amber</option>
                            <option value="violet">Violet</option>
                          </select>
                        </div>

                        {(() => {
                          const normalizedItems = block.data.items.map((item) =>
                            typeof item === "string"
                              ? { id: uuid(), text: item }
                              : item.id
                              ? item
                              : { ...item, id: uuid() }
                          );

                          return (
                            <>
                              <DndContext
                                collisionDetection={closestCenter}
                                onDragEnd={(e) => {
                                  const { active, over } = e;
                                  if (!over || active.id === over.id) return;

                                  const oldIndex = normalizedItems.findIndex(
                                    (i) => i.id === active.id
                                  );
                                  const newIndex = normalizedItems.findIndex(
                                    (i) => i.id === over.id
                                  );

                                  updateBlock(block.id, {
                                    items: arrayMove(
                                      normalizedItems,
                                      oldIndex,
                                      newIndex
                                    ),
                                  });
                                }}
                              >
                                <SortableContext
                                  items={normalizedItems.map((i) => i.id)}
                                  strategy={verticalListSortingStrategy}
                                >
                                  <div className="space-y-2">
                                    {normalizedItems.map((item, index) => (
                                      <SortableKeyPoint
                                        key={item.id}
                                        id={item.id}
                                        value={item.text}
                                        onChange={(v) => {
                                          const next = [...normalizedItems];
                                          next[index] = { ...item, text: v };
                                          updateBlock(block.id, {
                                            items: next,
                                          });
                                        }}
                                        onDelete={() =>
                                          updateBlock(block.id, {
                                            items: normalizedItems.filter(
                                              (i) => i.id !== item.id
                                            ),
                                          })
                                        }
                                      />
                                    ))}
                                  </div>
                                </SortableContext>
                              </DndContext>

                              <button
                                onClick={() =>
                                  updateBlock(block.id, {
                                    items: [
                                      ...normalizedItems,
                                      { id: uuid(), text: "" },
                                    ],
                                  })
                                }
                                className="text-sm text-blue-600"
                              >
                                + Add point
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    )}

                    {block.type === "KeyPointsMinimal" && (
                      <div className="border rounded-xl p-4 space-y-3">
                        <div className="text-sm font-medium text-gray-600">
                          Minimal Key Points
                        </div>

                        <input
                          placeholder="Optional title"
                          value={block.data.title ?? ""}
                          onChange={(e) =>
                            updateBlock(block.id, { title: e.target.value })
                          }
                          className="w-full border rounded px-3 py-2 text-sm"
                        />

                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={block.data.ordered ?? false}
                            onChange={(e) =>
                              updateBlock(block.id, {
                                ordered: e.target.checked,
                              })
                            }
                          />
                          Ordered list
                        </label>

                        <textarea
                          value={block.data.content}
                          onChange={(e) =>
                            updateBlock(block.id, { content: e.target.value })
                          }
                          placeholder={`- First point
            - Second point
            - Third point`}
                          className="w-full border rounded p-2 text-sm min-h-[120px]"
                        />
                      </div>
                    )}
                    {block.type === "Quote" && (
                      <textarea
                        value={block.data.text}
                        onChange={(e) =>
                          updateBlock(block.id, { text: e.target.value })
                        }
                        placeholder="Write quote..."
                        className="w-full border rounded-lg p-3 italic text-sm "
                      />
                    )}
                    {block.type === "Note" && (
                      <textarea
                        value={block.data.text}
                        onChange={(e) =>
                          updateBlock(block.id, { text: e.target.value })
                        }
                        placeholder="Write a note..."
                        className="w-full border rounded-md p-3 text-sm "
                      />
                    )}

                    {block.type === "NextRead" && (
                      <div className="border rounded-xl p-4 space-y-3 ">
                        <div className="text-sm font-medium text-sky-700">
                          Next Read
                        </div>

                        <input
                          type="text"
                          placeholder="Article title"
                          value={block.data.title}
                          onChange={(e) =>
                            updateBlock(block.id, { title: e.target.value })
                          }
                          className="w-full border rounded px-3 py-2 text-sm"
                        />

                        <input
                          type="text"
                          placeholder="Link (e.g. /blogs/how-to-study)"
                          value={block.data.href}
                          onChange={(e) =>
                            updateBlock(block.id, { href: e.target.value })
                          }
                          className="w-full border rounded px-3 py-2 text-sm"
                        />
                      </div>
                    )}

                    {block.type === "Video" && (
                      <Video
                        src={block.data.src}
                        showInput
                        showPreview={false}
                        onChange={(value) =>
                          updateBlock(block.id, { src: value })
                        }
                      />
                    )}
                  </SortableBlock>
                ))}
              </SortableContext>
            </DndContext>

            <div className="mt-6">
              <button
                onClick={exportMDX}
                className="px-4 py-2 bg-emerald-600 text-white rounded"
              >
                Export .mdx
              </button>
            </div>
          </div>

          {/* ================= RIGHT: PREVIEW ================= */}
          <div className="h-full overflow-y-auto px-10 py-6 border-l scrollbar-minimal">
            <BlogPostLayout metadata={metadata} showToc={false}>
              {blocks.map((block) => {
                switch (block.type) {
                  case "BlogHeading":
                    return (
                      <BlogHeading key={block.id}>
                        {block.data.text}
                      </BlogHeading>
                    );

                  case "BlogParagraph":
                    return (
                      <BlogParagraph key={block.id}>
                        {block.data.text}
                      </BlogParagraph>
                    );

                  case "Callout":
                    return (
                      <Callout key={block.id} type={block.data.variant}>
                        {block.data.text}
                      </Callout>
                    );

                  case "BlogImage":
                    return (
                      <BlogImage
                        key={block.id}
                        src={block.data.src}
                        alt={block.data.alt}
                        caption={block.data.caption}
                      ></BlogImage>
                    );

                  case "Divider":
                    return <Divider key={block.id}></Divider>;

                  case "Heading3":
                    return (
                      <Heading3 key={block.id}>{block.data.text}</Heading3>
                    );

                  case "KeyPoints":
                    return (
                      <KeyPoints
                        key={block.id}
                        items={block.data.items.map((i) => i.text)}
                        color={block.data.color}
                        variant={block.data.variant}
                        title={block.data.title}
                      />
                    );

                  case "KeyPointsMinimal":
                    return (
                      <KeyPointsMinimal
                        key={block.id}
                        title={block.data.title}
                        ordered={block.data.ordered}
                      >
                        {block.data.content}
                      </KeyPointsMinimal>
                    );

                  case "Quote":
                    return <Quote key={block.id}>{block.data.text}</Quote>;

                  case "Note":
                    return <Note key={block.id}>{block.data.text}</Note>;

                  case "NextRead":
                    return (
                      <NextRead
                        key={block.id}
                        title={block.data.title}
                        href={block.data.href}
                      />
                    );

                  case "Video":
                    return <Video key={block.id} src={block.data.src} />;
                  default:
                    return null;
                }
              })}
            </BlogPostLayout>
          </div>
        </div>
      )}
    </>
  );
}
