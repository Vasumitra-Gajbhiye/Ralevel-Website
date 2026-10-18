import { getListPage } from "@/lib/data/tasks/lists";
import { authorizeTasksApi, guarded, jsonError, readBody, respond } from "@/lib/tasks/api";
import { updateList } from "@/lib/tasks/mutations";
import { listPatchSchema } from "@/lib/validation/tasks";
import { NextResponse } from "next/server";

type Context = { params: Promise<{ listId: string }> };

export async function GET(req: Request, context: Context) {
  const auth = await authorizeTasksApi(req, { routeKey: "lists-get" });
  if (auth instanceof Response) return auth;

  return guarded("get list", async () => {
    const { listId } = await context.params;
    const showCompleted = new URL(req.url).searchParams.get("completed") === "1";
    const data = await getListPage(auth.actor, listId, { showCompleted });
    if (!data) return jsonError("Not found", 404);
    return NextResponse.json({ data });
  });
}

export async function PATCH(req: Request, context: Context) {
  const auth = await authorizeTasksApi(req, { write: true, routeKey: "lists-update" });
  if (auth instanceof Response) return auth;

  return guarded("update list", async () => {
    const { listId } = await context.params;
    const body = await readBody(req, listPatchSchema);
    if (!body.ok) return body.response;
    return respond(await updateList(auth.actor, listId, body.data));
  });
}
