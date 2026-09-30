"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type CardRowProps = {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
};

/** Section heading plus a horizontally scrolling track of cards. */
export default function CardRow({ title, subtitle, children }: CardRowProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateArrows();
    const observer = new ResizeObserver(updateArrows);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateArrows]);

  const scrollByPage = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const arrowClass =
    "hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white md:flex";

  return (
    <section className="w-full">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            {title}
          </h2>
          {subtitle && (
            <div className="mt-1 text-sm text-slate-500">{subtitle}</div>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            className={arrowClass}
            onClick={() => scrollByPage(-1)}
            disabled={!canPrev}
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={arrowClass}
            onClick={() => scrollByPage(1)}
            disabled={!canNext}
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ul
        ref={trackRef}
        onScroll={updateArrows}
        className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
    </section>
  );
}
