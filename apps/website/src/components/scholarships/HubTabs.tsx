import { cn } from "@/lib/utils";
import Link from "next/link";

type Tab = "scholarships" | "universities" | "saved";

const TABS: { key: Tab; label: string; href: string }[] = [
  { key: "scholarships", label: "Scholarships", href: "/scholarships" },
  { key: "universities", label: "Universities", href: "/scholarships/universities" },
  { key: "saved", label: "Saved", href: "/scholarships/saved" },
];

/** The hub's only navigation: three places to go. */
export default function HubTabs({
  active,
  savedCount,
}: {
  active: Tab;
  savedCount?: number;
}) {
  return (
    <nav aria-label="Scholarship hub" className="flex justify-center">
      <div className="inline-flex rounded-xl bg-slate-100 p-1">
        {TABS.map((tab) => {
          const current = tab.key === active;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={current ? "page" : undefined}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 sm:px-4",
                current
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              {tab.label}
              {tab.key === "saved" && savedCount ? (
                <span className="ml-1.5 text-slate-400">{savedCount}</span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function HubHeader({
  title,
  subtitle,
  active,
  savedCount,
}: {
  title: string;
  subtitle: string;
  active: Tab;
  savedCount?: number;
}) {
  return (
    <header className="text-center">
      <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">{title}</h1>
      <p className="mx-auto mt-3 max-w-md text-slate-500">{subtitle}</p>
      <div className="mt-8">
        <HubTabs active={active} savedCount={savedCount} />
      </div>
    </header>
  );
}
