/** Shared server helper for /tasks pages. */
import { isStaff } from "@/lib/roles";
import { redirect } from "next/navigation";
import { getTasksContext } from "./actor";
import { ensureInbox } from "./mutations";

/** The staff actor and their inbox id; redirects anyone else to the home page. */
export async function requireTasksActor() {
  const ctx = await getTasksContext();
  if (!ctx || !isStaff(ctx.actor.roles)) redirect("/");
  const inboxId = await ensureInbox(ctx.actor.id);
  return { ctx, actor: ctx.actor, inboxId };
}
