import { authorizeTasksApi, guarded, readBody, respond } from "@/lib/tasks/api";
import { submitForReview } from "@/lib/tasks/mutations";
import { submitSchema } from "@/lib/validation/tasks";

type Context = { params: Promise<{ taskId: string }> };

/** { link?, note? }: the assignee hands in a task with a star reward. */
export async function POST(req: Request, context: Context) {
  const auth = await authorizeTasksApi(req, { write: true, routeKey: "tasks-submit" });
  if (auth instanceof Response) return auth;

  return guarded("submit task", async () => {
    const { taskId } = await context.params;
    const body = await readBody(req, submitSchema);
    if (!body.ok) return body.response;
    return respond(await submitForReview(auth.actor, taskId, body.data));
  });
}
