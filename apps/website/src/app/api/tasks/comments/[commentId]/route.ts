import { authorizeTasksApi, guarded, readBody, respond } from "@/lib/tasks/api";
import { deleteComment, editComment } from "@/lib/tasks/mutations";
import { commentSchema } from "@/lib/validation/tasks";

type Context = { params: Promise<{ commentId: string }> };

export async function PATCH(req: Request, context: Context) {
  const auth = await authorizeTasksApi(req, { write: true, routeKey: "comments-update" });
  if (auth instanceof Response) return auth;

  return guarded("edit comment", async () => {
    const { commentId } = await context.params;
    const body = await readBody(req, commentSchema);
    if (!body.ok) return body.response;
    return respond(await editComment(auth.actor, commentId, body.data.body));
  });
}

export async function DELETE(req: Request, context: Context) {
  const auth = await authorizeTasksApi(req, { write: true, routeKey: "comments-delete" });
  if (auth instanceof Response) return auth;

  return guarded("delete comment", async () => {
    const { commentId } = await context.params;
    return respond(await deleteComment(auth.actor, commentId));
  });
}
