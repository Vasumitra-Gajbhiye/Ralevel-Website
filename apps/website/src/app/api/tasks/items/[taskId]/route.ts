import { getTaskDetail } from "@/lib/data/tasks/detail";
import { authorizeTasksApi, guarded, jsonError, readBody, respond } from "@/lib/tasks/api";
import { deleteTask, updateTask } from "@/lib/tasks/mutations";
import { taskPatchSchema } from "@/lib/validation/tasks";
import { NextResponse } from "next/server";

type Context = { params: Promise<{ taskId: string }> };

/** Detail sheet: the task with its subtasks, comments and recent activity. */
export async function GET(req: Request, context: Context) {
  const auth = await authorizeTasksApi(req, { routeKey: "tasks-get" });
  if (auth instanceof Response) return auth;

  return guarded("get task", async () => {
    const { taskId } = await context.params;
    const data = await getTaskDetail(auth.actor, taskId);
    if (!data) return jsonError("Not found", 404);
    return NextResponse.json({ data });
  });
}

export async function PATCH(req: Request, context: Context) {
  const auth = await authorizeTasksApi(req, { write: true, routeKey: "tasks-update" });
  if (auth instanceof Response) return auth;

  return guarded("update task", async () => {
    const { taskId } = await context.params;
    const body = await readBody(req, taskPatchSchema);
    if (!body.ok) return body.response;
    return respond(await updateTask(auth.actor, taskId, body.data));
  });
}

export async function DELETE(req: Request, context: Context) {
  const auth = await authorizeTasksApi(req, { write: true, routeKey: "tasks-delete" });
  if (auth instanceof Response) return auth;

  return guarded("delete task", async () => {
    const { taskId } = await context.params;
    return respond(await deleteTask(auth.actor, taskId));
  });
}
