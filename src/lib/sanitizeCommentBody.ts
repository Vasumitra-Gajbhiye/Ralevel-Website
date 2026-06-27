export const COMMENT_BODY_MAX_LENGTH = 2000;

type Segment =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string };

/** Strip HTML tags and decode common entities to plain text. */
function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

/**
 * Parse a markdown subset (**bold**, *italic*, _italic_) into segments.
 * Does not support nesting of the same type or links/headers/etc.
 */
export function parseCommentBody(input: string): Segment[] {
  const text = stripHtml(input);
  const segments: Segment[] = [];
  let i = 0;

  while (i < text.length) {
    if (text.startsWith("**", i)) {
      const end = text.indexOf("**", i + 2);
      if (end !== -1) {
        const value = text.slice(i + 2, end);
        if (value.length > 0) {
          segments.push({ type: "bold", value });
        }
        i = end + 2;
        continue;
      }
    }

    const italicMarker = text[i];
    if (italicMarker === "*" || italicMarker === "_") {
      if (text.startsWith("**", i)) {
        // handled above or unmatched
      } else {
        const end = text.indexOf(italicMarker, i + 1);
        if (end !== -1) {
          const value = text.slice(i + 1, end);
          if (value.length > 0) {
            segments.push({ type: "italic", value });
          }
          i = end + 1;
          continue;
        }
      }
    }

    const nextBold = text.indexOf("**", i);
    const nextStar = text.indexOf("*", i);
    const nextUnderscore = text.indexOf("_", i);

    const candidates = [nextBold, nextStar, nextUnderscore].filter((n) => n !== -1);
    const nextSpecial = candidates.length > 0 ? Math.min(...candidates) : -1;
    const end = nextSpecial === -1 ? text.length : nextSpecial;

    if (end > i) {
      segments.push({ type: "text", value: text.slice(i, end) });
    }
    i = end === i ? i + 1 : end;
  }

  return segments;
}

/** Serialize segments back to markdown subset string. */
export function serializeCommentBody(segments: Segment[]): string {
  return segments
    .map((seg) => {
      if (seg.type === "bold") return `**${seg.value}**`;
      if (seg.type === "italic") return `*${seg.value}*`;
      return seg.value;
    })
    .join("");
}

/**
 * Sanitize comment body: allow only bold/italic markdown, enforce max length.
 * Returns empty string if nothing remains after sanitization.
 */
export function sanitizeCommentBody(input: string): string {
  const trimmed = stripHtml(input).trim();
  if (!trimmed) return "";

  const segments = parseCommentBody(trimmed);
  const sanitized = serializeCommentBody(segments).trim();

  if (!sanitized) return "";
  if (sanitized.length > COMMENT_BODY_MAX_LENGTH) {
    return sanitized.slice(0, COMMENT_BODY_MAX_LENGTH);
  }

  return sanitized;
}

/** Plain text length (ignoring markdown markers) for empty checks. */
export function commentBodyPlainLength(input: string): number {
  return parseCommentBody(input).reduce((sum, seg) => sum + seg.value.length, 0);
}
