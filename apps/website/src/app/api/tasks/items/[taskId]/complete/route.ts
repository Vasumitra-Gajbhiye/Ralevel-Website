import { authorizeTasksApi, guarded, readBody, respond } from "@/lib/tasks/api";
import { setTaskCompleted } from "@/lib/tasks/mutations";
import { completeSchema } from "@/lib/validation/tasks";

type Context = { params: Promise<{ taskId: string }> };

/** { completed } — repeating tasks move to their next date instead of closing. */
export async function POST(req: Request, context: Context) {
  const auth = await authorizeTasksApi(req, { write: true, routeKey: "tasks-complete" });
  if (auth instanceof Response) return auth;

  return guarded("complete task", async () => {
    const { taskId } = await context.params;
    const body = await readBody(req, completeSchema);
    if (!body.ok) return body.response;
    return respond(await setTaskCompleted(auth.actor, taskId, body.data.completed));
  });
}
