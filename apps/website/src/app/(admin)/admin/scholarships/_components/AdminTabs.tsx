"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminTabs({
  pendingSubmissions,
  showTeam,
}: {
  pendingSubmissions: number;
  showTeam: boolean;
}) {
  const pathname = usePathname() ?? "";
  const tabs = [
    { href: "/admin/scholarships/universities", label: "Universities" },
    { href: "/admin/scholarships/submissions", label: "Submissions", count: pendingSubmissions },
    ...(showTeam ? [{ href: "/admin/scholarships/team", label: "Team" }] : []),
  ];
  const active =
    tabs.find((t) => pathname.startsWith(t.href))?.href ?? "/admin/scholarships";

  return (
    <nav className="flex gap-1 border-b border-slate-200">
      {[{ href: "/admin/scholarships", label: "Scholarships" }, ...tabs].map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "-mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
            active === tab.href
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-900",
          )}
        >
          {tab.label}
          {"count" in tab && tab.count ? (
            <span className="ml-1.5 rounded-full bg-blue-600 px-1.5 py-0.5 text-xs text-white">
              {tab.count}
            </span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}
