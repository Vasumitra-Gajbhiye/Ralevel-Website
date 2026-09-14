type TextInline = {
  type: "text";
  text: string;
  styles: Record<string, boolean>;
};

type LinkInline = {
  type: "link";
  href: string;
  content: TextInline[];
};

type InlineContent = TextInline | LinkInline;

type LegalBlock = {
  id: string;
  type: "paragraph" | "heading" | "bulletListItem" | "numberedListItem";
  props: {
    textColor: "default";
    backgroundColor: "default";
    textAlignment: "left";
    level?: number;
  };
  content: InlineContent[];
  children: [];
};

function createIdFactory() {
  let seedId = 0;
  return () => {
    seedId += 1;
    return `lp${seedId.toString(36).padStart(8, "0")}`;
  };
}

function textInline(text: string, styles: Record<string, boolean> = {}): TextInline {
  return { type: "text", text, styles };
}

function parseInline(input: string): InlineContent[] {
  const result: InlineContent[] = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      result.push(textInline(input.slice(lastIndex, match.index)));
    }

    if (match[1] !== undefined && match[2] !== undefined) {
      result.push({
        type: "link",
        href: match[2],
        content: [textInline(match[1])],
      });
    } else if (match[3] !== undefined) {
      result.push(textInline(match[3], { bold: true }));
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < input.length) {
    result.push(textInline(input.slice(lastIndex)));
  }

  return result.length > 0 ? result : [textInline("")];
}

function paragraph(text: string, nextId: () => string): LegalBlock {
  return {
    id: nextId(),
    type: "paragraph",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: parseInline(text),
    children: [],
  };
}

function heading(level: number, text: string, nextId: () => string): LegalBlock {
  return {
    id: nextId(),
    type: "heading",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
      level,
    },
    content: parseInline(text),
    children: [],
  };
}

function bullet(text: string, nextId: () => string): LegalBlock {
  return {
    id: nextId(),
    type: "bulletListItem",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: parseInline(text),
    children: [],
  };
}

function numbered(text: string, nextId: () => string): LegalBlock {
  return {
    id: nextId(),
    type: "numberedListItem",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    content: parseInline(text),
    children: [],
  };
}

function headingFromLine(line: string, nextId: () => string): LegalBlock | null {
  const match = /^(#{1,3})\s+(.+)$/.exec(line);
  if (!match) return null;
  return heading(match[1].length, match[2], nextId);
}

export function markdownToBlocks(markdown: string): LegalBlock[] {
  const nextId = createIdFactory();
  const blocks: LegalBlock[] = [];
  const chunks = markdown.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);

  for (const chunk of chunks) {
    const lines = chunk.split("\n").map((line) => line.trimEnd());
    if (lines.length === 0) continue;

    if (lines.length === 1) {
      const asHeading = headingFromLine(lines[0], nextId);
      if (asHeading) {
        blocks.push(asHeading);
        continue;
      }
    }

    const bulletLines = lines.filter((line) => /^[-*]\s+/.test(line));
    if (bulletLines.length === lines.length) {
      for (const line of lines) {
        blocks.push(bullet(line.replace(/^[-*]\s+/, ""), nextId));
      }
      continue;
    }

    const numberedLines = lines.filter((line) => /^\d+\.\s+/.test(line));
    if (numberedLines.length === lines.length) {
      for (const line of lines) {
        blocks.push(numbered(line.replace(/^\d+\.\s+/, ""), nextId));
      }
      continue;
    }

    let paragraphBuf: string[] = [];
    const flushParagraph = () => {
      const text = paragraphBuf.join(" ").trim();
      if (text) blocks.push(paragraph(text, nextId));
      paragraphBuf = [];
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        flushParagraph();
        continue;
      }

      const asHeading = headingFromLine(trimmed, nextId);
      if (asHeading) {
        flushParagraph();
        blocks.push(asHeading);
        continue;
      }

      if (/^[-*]\s+/.test(trimmed)) {
        flushParagraph();
        blocks.push(bullet(trimmed.replace(/^[-*]\s+/, ""), nextId));
        continue;
      }

      if (/^\d+\.\s+/.test(trimmed)) {
        flushParagraph();
        blocks.push(numbered(trimmed.replace(/^\d+\.\s+/, ""), nextId));
        continue;
      }

      paragraphBuf.push(trimmed);
    }

    flushParagraph();
  }

  return blocks;
}
