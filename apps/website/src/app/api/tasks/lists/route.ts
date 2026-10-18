import { authorizeTasksApi, guarded, readBody, respond } from "@/lib/tasks/api";
import { createList } from "@/lib/tasks/mutations";
import { listCreateSchema } from "@/lib/validation/tasks";

export async function POST(req: Request) {
  const auth = await authorizeTasksApi(req, { write: true, routeKey: "lists-create" });
  if (auth instanceof Response) return auth;

  return guarded("create list", async () => {
    const body = await readBody(req, listCreateSchema);
    if (!body.ok) return body.response;
    return respond(await createList(auth.actor, body.data), 201);
  });
}
