import { authorizeTasksApi, guarded, respond } from "@/lib/tasks/api";
import { claimTask, unclaimTask } from "@/lib/tasks/mutations";

type Context = { params: Promise<{ taskId: string }> };

/** Take an open task: the caller becomes its assignee. */
export async function POST(req: Request, context: Context) {
  const auth = await authorizeTasksApi(req, { write: true, routeKey: "tasks-claim" });
  if (auth instanceof Response) return auth;

  return guarded("claim task", async () => {
    const { taskId } = await context.params;
    return respond(await claimTask(auth.actor, taskId));
  });
}

/** Hand a claimed task back so someone else can take it. */
export async function DELETE(req: Request, context: Context) {
  const auth = await authorizeTasksApi(req, { write: true, routeKey: "tasks-claim" });
  if (auth instanceof Response) return auth;

  return guarded("unclaim task", async () => {
    const { taskId } = await context.params;
    return respond(await unclaimTask(auth.actor, taskId));
  });
}
