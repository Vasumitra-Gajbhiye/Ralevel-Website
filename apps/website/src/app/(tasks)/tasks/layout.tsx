import { TasksShell } from "@/components/tasks/TasksShell";
import type { DevUser } from "@/components/tasks/TasksSidebar";
import { getSidebarData } from "@/lib/data/tasks/workspace";
import { getWritableLists } from "@/lib/data/tasks/lists";
import connectDB from "@/lib/mongodb";
import { canAccessAdminPanel, isAdmin, isStaff } from "@/lib/roles";
import { devImpersonationAllowed, getTasksContext } from "@/lib/tasks/actor";
import { istTodayKey } from "@/lib/tasks/dates";
import { departmentsForRoles } from "@/lib/tasks/departments";
import { ensureInbox } from "@/lib/tasks/mutations";
import type { SidebarData } from "@/lib/tasks/types";
import UserData from "@/models/userData";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Tasks · r/alevel",
  robots: { index: false, follow: false },
};

async function loadDevUsers(): Promise<DevUser[]> {
  await connectDB();
  const users = await UserData.find({ "roles.0": { $exists: true } })
    .select("name email roles")
    .sort({ name: 1 })
    .limit(100)
    .lean<{ _id: unknown; name?: string; email: string; roles: string[] }[]>();
  return users.map((u) => ({ id: String(u._id), label: `${u.name || u.email} — ${u.roles.join(", ")}` }));
}

const EMPTY_SIDEBAR: SidebarData = {
  inbox: { id: "", openCount: 0 },
  counts: { today: 0, overdue: 0, upcoming: 0, my: 0 },
  departments: [],
};

export default async function TasksLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getTasksContext();
  if (!ctx) redirect("/");

  const { actor } = ctx;
  const staff = isStaff(actor.roles);
  const devUsers = devImpersonationAllowed(ctx.realActor) ? await loadDevUsers() : null;
  const viewer = {
    id: actor.id,
    name: ctx.name,
    isAdmin: isAdmin(actor.roles),
    canAccessAdmin: canAccessAdminPanel(actor.roles),
    impersonating: ctx.impersonating,
  };

  // Only reachable while "viewing as" a non-staff user in local development.
  if (!staff) {
    return (
      <TasksShell viewer={viewer} inboxId="" todayKey={istTodayKey()} writableLists={[]} sidebar={EMPTY_SIDEBAR} devUsers={devUsers}>
        <div className="p-10 text-sm text-gray-600">
          This user isn&apos;t current staff, so they&apos;d be sent back to the home page.
        </div>
      </TasksShell>
    );
  }

  const inboxId = await ensureInbox(actor.id);
  const [sidebar, writableLists] = await Promise.all([
    getSidebarData(actor, inboxId),
    getWritableLists(actor, inboxId, departmentsForRoles(actor.roles).map((d) => d.key)),
  ]);

  return (
    <TasksShell
      viewer={viewer}
      inboxId={inboxId}
      todayKey={istTodayKey()}
      writableLists={writableLists}
      sidebar={sidebar}
      devUsers={devUsers}
    >
      {children}
    </TasksShell>
  );
}
