"use client";

import type { LegalTocItem } from "@/lib/legal-pages/toc";
import { useEffect } from "react";

/**
 * The BlockNote viewer is client-only, so heading elements don't exist on
 * first paint. Once they mount, give each H2 a readable id so plain
 * `#slug` links work, and honour a hash present on initial load.
 */
function useHeadingAnchors(items: LegalTocItem[]) {
  useEffect(() => {
    if (items.length === 0) return;

    let scrolledToHash = false;

    const assign = () => {
      let missing = false;
      for (const { slug, blockId } of items) {
        const el = document.querySelector<HTMLElement>(
          `[data-id="${CSS.escape(blockId)}"]`,
        );
        if (!el) {
          missing = true;
          continue;
        }
        if (el.id !== slug) el.id = slug;
      }

      if (!scrolledToHash) {
        const hash = decodeURIComponent(window.location.hash.slice(1));
        const target = hash ? document.getElementById(hash) : null;
        if (target && items.some((item) => item.slug === hash)) {
          target.scrollIntoView();
          scrolledToHash = true;
        }
      }

      return !missing;
    };

    if (assign()) return;

    const observer = new MutationObserver(() => {
      if (assign()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [items]);
}

export default function LegalTableOfContents({
  items,
}: {
  items: LegalTocItem[];
}) {
  useHeadingAnchors(items);

  if (items.length < 2) return null;

  return (
    <nav
      aria-label="Quick navigation"
      className="mb-8 rounded-xl border border-blue-100 bg-blue-50/40 p-4"
    >
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">
        Quick Navigation
      </h2>
      <ul className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        {items.map(({ slug, label }) => (
          <li key={slug}>
            <a
              href={`#${slug}`}
              className="text-blue-600 transition-colors hover:text-blue-700"
            >
              • {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
