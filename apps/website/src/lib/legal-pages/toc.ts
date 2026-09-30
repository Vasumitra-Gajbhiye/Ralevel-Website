export type LegalTocItem = {
  slug: string;
  blockId: string;
  label: string;
};

const TOC_HEADING_LEVEL = 2;

type BlockLike = {
  id?: unknown;
  type?: unknown;
  props?: { level?: unknown };
  content?: unknown;
  children?: unknown;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function inlineText(content: unknown): string {
  if (!Array.isArray(content)) return "";

  return content
    .map((item) => {
      if (!isObject(item)) return "";
      if (item.type === "text" && typeof item.text === "string") {
        return item.text;
      }
      if (item.type === "link") return inlineText(item.content);
      return "";
    })
    .join("");
}

function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['\u2019]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/[\s-]+/g, "-");
}

/** Builds the Quick Navigation entries from a legal page's BlockNote content. */
export function extractLegalToc(content: unknown): LegalTocItem[] {
  const items: LegalTocItem[] = [];
  const seen = new Map<string, number>();

  function walk(blocks: unknown) {
    if (!Array.isArray(blocks)) return;

    for (const block of blocks as BlockLike[]) {
      if (!isObject(block)) continue;

      if (
        block.type === "heading" &&
        block.props?.level === TOC_HEADING_LEVEL &&
        typeof block.id === "string"
      ) {
        const label = inlineText(block.content).trim();
        if (label) {
          const base = slugify(label) || "section";
          const count = (seen.get(base) ?? 0) + 1;
          seen.set(base, count);
          items.push({
            slug: count === 1 ? base : `${base}-${count}`,
            blockId: block.id,
            label,
          });
        }
      }

      walk(block.children);
    }
  }

  walk(content);
  return items;
}
