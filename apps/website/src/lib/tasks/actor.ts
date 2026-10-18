/**
 * Resolves who is using /tasks. Server-only.
 *
 * Local development can "view as" another user to check permissions, but only
 * when every guard holds: not production, TASKS_DEV_IMPERSONATION=true, the
 * database is on localhost, and the real user is an admin.
 */
import { getAuthSession } from "@/lib/getAuthSession";
import connectDB from "@/lib/mongodb";
import { isAdmin, isStaff, sanitizeRoles } from "@/lib/roles";
import UserData from "@/models/userData";
import type { AuthSession } from "@/types/auth";
import { isValidObjectId } from "mongoose";
import { cookies } from "next/headers";
import { cache } from "react";
import type { TasksActor } from "./permissions";

export const DEV_ACT_AS_COOKIE = "tasks_dev_as";

export type TasksContext = {
  session: AuthSession;
  actor: TasksActor;
  /** The signed-in user, when different from `actor` (dev "view as"). */
  realActor: TasksActor;
  impersonating: boolean;
  name: string;
};

function isLocalDatabase(): boolean {
  try {
    const uri = process.env.MONGODB_URI?.trim() ?? "";
    if (!uri.startsWith("mongodb://")) return false;
    const host = new URL(uri).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}

export function devImpersonationAllowed(realActor: TasksActor): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.TASKS_DEV_IMPERSONATION === "true" &&
    isLocalDatabase() &&
    isAdmin(realActor.roles)
  );
}

/** The current /tasks user, or null when signed out or not staff. */
export const getTasksContext = cache(async (): Promise<TasksContext | null> => {
  const session = await getAuthSession();
  if (!session) return null;

  const realActor: TasksActor = { id: session.userData.id, roles: session.userData.roles };
  let actor = realActor;
  let name = session.user.name || session.user.email;
  let impersonating = false;

  if (devImpersonationAllowed(realActor)) {
    const asId = (await cookies()).get(DEV_ACT_AS_COOKIE)?.value;
    if (asId && asId !== realActor.id && isValidObjectId(asId)) {
      await connectDB();
      const user = await UserData.findById(asId).select("name email roles").lean<{
        name?: string;
        email: string;
        roles?: string[];
      }>();
      if (user) {
        actor = { id: asId, roles: sanitizeRoles(user.roles) };
        name = user.name || user.email;
        impersonating = true;
      }
    }
  }

  // An impersonated non-staff user still gets through so the switcher can be used to go back.
  if (!isStaff(actor.roles) && !impersonating) return null;
  return { session, actor, realActor, impersonating, name };
});
