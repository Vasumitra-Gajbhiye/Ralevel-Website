"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

/** Search box + view select; both live in the URL so the server does the filtering. */
export default function ListToolbar({
  q,
  view,
  views,
  children,
}: {
  q: string;
  view: string;
  views: { value: string; label: string }[];
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [draft, setDraft] = useState(q);

  function go(next: { q?: string; view?: string }) {
    const params = new URLSearchParams();
    const nextQ = next.q ?? q;
    const nextView = next.view ?? view;
    if (nextQ) params.set("q", nextQ);
    if (nextView !== "all") params.set("view", nextView);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    go({ q: draft.trim() });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form onSubmit={submit} className="relative min-w-[12rem] flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => draft.trim() !== q && go({ q: draft.trim() })}
          placeholder="Search"
          className="pl-8"
        />
      </form>
      <select
        value={view}
        onChange={(e) => go({ view: e.target.value })}
        className="h-9 rounded-md border border-input bg-white px-3 text-sm shadow-sm"
      >
        {views.map((v) => (
          <option key={v.value} value={v.value}>
            {v.label}
          </option>
        ))}
      </select>
      {children}
    </div>
  );
}
