"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  hasAnyRole,
  RESOURCE_ACCESS_MANAGE_ROLES,
  RESOURCE_CMS_ROLES,
  type Role,
} from "@/lib/roles";
import { Menu } from "lucide-react";
import { useState } from "react";

function AdminSidebarNav({
  roles,
  onNavigate,
}: {
  roles: Role[];
  onNavigate?: () => void;
}) {
  const linkClass = "block px-3 py-2 rounded hover:bg-gray-100";

  return (
    <nav className="space-y-2 text-sm">
      {hasAnyRole(roles, ["owner", "admin", "writer"]) && (
        <a href="/admin/blogs/v2" className={linkClass} onClick={onNavigate}>
          Blogs
        </a>
      )}

      {hasAnyRole(roles, ["owner", "admin"]) && (
        <a href="/admin/access" className={linkClass} onClick={onNavigate}>
          Access
        </a>
      )}
      {hasAnyRole(roles, ["owner", "admin", "mod_dep_head"]) && (
        <a href="/admin/team" className={linkClass} onClick={onNavigate}>
          Mod. Staff
        </a>
      )}
      {hasAnyRole(roles, ["owner", "admin", "helper_dep_head"]) && (
        <a href="/admin/helper" className={linkClass} onClick={onNavigate}>
          Helper
        </a>
      )}
      {hasAnyRole(roles, ["owner", "admin", "graphic_dep_head"]) && (
        <a href="/admin/graphic" className={linkClass} onClick={onNavigate}>
          Graphic Dept.
        </a>
      )}
      {hasAnyRole(roles, ["owner", "admin", "info_dep_head"]) && (
        <a href="/admin/info" className={linkClass} onClick={onNavigate}>
          Community Dept.
        </a>
      )}
      {hasAnyRole(roles, RESOURCE_ACCESS_MANAGE_ROLES) && (
        <a href="/admin/resource" className={linkClass} onClick={onNavigate}>
          Resource Dept.
        </a>
      )}
      {hasAnyRole(roles, [
        "owner",
        "admin",
        "mod_dep_head",
        "info_dep_head",
        "graphic_dep_head",
        "helper_dep_head",
      ]) && (
        <a href="/admin/forms" className={linkClass} onClick={onNavigate}>
          Form submission
        </a>
      )}
      {hasAnyRole(roles, ["owner", "admin"]) && (
        <a
          href="/admin/certificates"
          className={linkClass}
          onClick={onNavigate}
        >
          Certificates
        </a>
      )}

      {hasAnyRole(roles, [
        "owner",
        "admin",
        "informative_team",
        "info_dep_head",
      ]) && (
        <a href="/admin/scheduling" className={linkClass} onClick={onNavigate}>
          Scheduling
        </a>
      )}

      {hasAnyRole(roles, ["owner", "admin", "mod_dep_head"]) && (
        <a href="/admin/qotd" className={linkClass} onClick={onNavigate}>
          Discord QOTD
        </a>
      )}
      {hasAnyRole(roles, RESOURCE_CMS_ROLES) && (
        <>
          <a
            href="/admin/resource-cms"
            className={linkClass}
            onClick={onNavigate}
          >
            Resource CMS
          </a>
          <a
            href="/admin/resource-cms/history"
            className={linkClass}
            onClick={onNavigate}
          >
            CMS History
          </a>
        </>
      )}
    </nav>
  );
}

export default function AdminLayoutShell({
  roles,
  children,
}: {
  roles: Role[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

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
              <AdminSidebarNav roles={roles} onNavigate={closeSidebar} />
            </div>
          </SheetContent>
        </Sheet>
        <h2 className="text-lg font-semibold">Admin</h2>
      </header>

      <aside className="hidden md:block w-64 shrink-0 border-r bg-white px-4 py-6">
        <h2 className="text-lg font-semibold mb-6">Admin</h2>
        <AdminSidebarNav roles={roles} />
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
