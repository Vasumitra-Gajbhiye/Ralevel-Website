import { authorizeTasksApi, guarded, readBody, respond } from "@/lib/tasks/api";
import { moveTasks } from "@/lib/tasks/mutations";
import { moveSchema } from "@/lib/validation/tasks";

type Context = { params: Promise<{ listId: string }> };

/** Drag and drop: { sectionId, orderedIds } is the destination section's full order. */
export async function POST(req: Request, context: Context) {
  const auth = await authorizeTasksApi(req, { write: true, routeKey: "tasks-move" });
  if (auth instanceof Response) return auth;

  return guarded("move tasks", async () => {
    const { listId } = await context.params;
    const body = await readBody(req, moveSchema);
    if (!body.ok) return body.response;
    return respond(await moveTasks(auth.actor, listId, body.data));
  });
}
