import { authorizeTasksApi, guarded, readBody, respond } from "@/lib/tasks/api";
import { reviewTask } from "@/lib/tasks/mutations";
import { reviewSchema } from "@/lib/validation/tasks";

type Context = { params: Promise<{ taskId: string }> };

/** { decision: "approve" } pays the stars; { decision: "changes", comment } sends it back. */
export async function POST(req: Request, context: Context) {
  const auth = await authorizeTasksApi(req, { write: true, routeKey: "tasks-review" });
  if (auth instanceof Response) return auth;

  return guarded("review task", async () => {
    const { taskId } = await context.params;
    const body = await readBody(req, reviewSchema);
    if (!body.ok) return body.response;
    return respond(await reviewTask(auth.actor, taskId, body.data));
  });
}
