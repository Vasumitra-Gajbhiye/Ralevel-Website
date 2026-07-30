import type { Block } from "@blocknote/core";

/** BlockNote rejects empty/invalid arrays as initialContent — omit for new docs. */
export function resolveInitialContent(content?: unknown): Block[] | undefined {
  if (!Array.isArray(content) || content.length === 0) return undefined;

  const valid = content.every(
    (block) =>
      block !== null &&
      typeof block === "object" &&
      "type" in block &&
      typeof (block as { type: unknown }).type === "string",
  );

  if (!valid) return undefined;

  return content as Block[];
}
