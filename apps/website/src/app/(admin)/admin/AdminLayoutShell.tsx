"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { AdminNavLink } from "@/lib/admin-access/sections";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

function isBlogEditorPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return /^\/admin\/blogs\/v2\/[^/]+\/edit$/.test(pathname);
}

function isLegalEditorPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return /^\/admin\/legal\/.+/.test(pathname);
}

function AdminSidebarNav({
  nav,
  onNavigate,
}: {
  nav: AdminNavLink[];
  onNavigate?: () => void;
}) {
  const linkClass = "block px-3 py-2 rounded hover:bg-gray-100";

  return (
    <nav className="space-y-2 text-sm">
      <a href="/tasks" className={linkClass} onClick={onNavigate}>
        Tasks
      </a>
      {nav.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className={linkClass}
          onClick={onNavigate}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}

export default function AdminLayoutShell({
  nav,
  children,
}: {
  nav: AdminNavLink[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isBlogEditor = isBlogEditorPath(pathname);
  const isFullBleedEditor = isBlogEditor || isLegalEditorPath(pathname);

  const closeSidebar = () => setOpen(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <header className="md:hidden sticky top-0 z-40 flex items-center gap-3 border-b bg-white px-4 py-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open admin menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Admin navigation</SheetTitle>
            <div className="px-4 py-6">
              <h2 className="text-lg font-semibold mb-6">Admin</h2>
              <AdminSidebarNav nav={nav} onNavigate={closeSidebar} />
            </div>
          </SheetContent>
        </Sheet>
        <h2 className="text-lg font-semibold">Admin</h2>
      </header>

      <aside className="hidden md:block w-64 shrink-0 border-r bg-white px-4 py-6">
        <h2 className="text-lg font-semibold mb-6">Admin</h2>
        <AdminSidebarNav nav={nav} />
      </aside>

      <main
        className={cn(
          "flex-1",
          isFullBleedEditor ? "overflow-hidden p-0" : "overflow-y-auto p-4 md:p-8",
        )}
      >
        {children}
      </main>
    </div>
  );
}
