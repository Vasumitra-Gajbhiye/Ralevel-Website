import { authorizeTasksApi, guarded, readBody, respond } from "@/lib/tasks/api";
import { createTask } from "@/lib/tasks/mutations";
import { taskCreateSchema } from "@/lib/validation/tasks";

/** Creates a task, or a subtask when `parentId` is set. */
export async function POST(req: Request) {
  const auth = await authorizeTasksApi(req, { write: true, routeKey: "tasks-create" });
  if (auth instanceof Response) return auth;

  return guarded("create task", async () => {
    const body = await readBody(req, taskCreateSchema);
    if (!body.ok) return body.response;
    return respond(await createTask(auth.actor, body.data), 201);
  });
}
