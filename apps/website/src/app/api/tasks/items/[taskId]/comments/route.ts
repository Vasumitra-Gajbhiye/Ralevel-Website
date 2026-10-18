import { authorizeTasksApi, guarded, readBody, respond } from "@/lib/tasks/api";
import { addComment } from "@/lib/tasks/mutations";
import { commentSchema } from "@/lib/validation/tasks";

type Context = { params: Promise<{ taskId: string }> };

export async function POST(req: Request, context: Context) {
  const auth = await authorizeTasksApi(req, { write: true, routeKey: "comments-create" });
  if (auth instanceof Response) return auth;

  return guarded("add comment", async () => {
    const { taskId } = await context.params;
    const body = await readBody(req, commentSchema);
    if (!body.ok) return body.response;
    return respond(await addComment(auth.actor, taskId, body.data.body), 201);
  });
}
