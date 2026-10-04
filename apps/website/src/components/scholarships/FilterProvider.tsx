"use client";

import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useTransition } from "react";

type FilterNav = {
  /** Replace the URL query (e.g. "?dest=CA") without scrolling. */
  navigate: (query: string) => void;
  isPending: boolean;
};

const FilterNavContext = createContext<FilterNav | null>(null);

/** Filters live in the URL; the server re-renders results on each change. */
export function FilterProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const navigate = useCallback(
    (query: string) => {
      startTransition(() => {
        router.replace(`${pathname}${query}`, { scroll: false });
      });
    },
    [pathname, router],
  );

  return (
    <FilterNavContext.Provider value={{ navigate, isPending }}>
      {children}
    </FilterNavContext.Provider>
  );
}

export function useFilterNav(): FilterNav {
  const ctx = useContext(FilterNavContext);
  if (!ctx) throw new Error("useFilterNav must be used inside <FilterProvider>");
  return ctx;
}

/** Dims server-rendered results while a filter change is loading. */
export function ResultsArea({ children }: { children: React.ReactNode }) {
  const { isPending } = useFilterNav();
  return (
    <div
      aria-busy={isPending}
      className={cn("transition-opacity", isPending && "opacity-50")}
    >
      {children}
    </div>
  );
}
