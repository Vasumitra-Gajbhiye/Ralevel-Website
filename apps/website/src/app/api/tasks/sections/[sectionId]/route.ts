import { authorizeTasksApi, guarded, readBody, respond } from "@/lib/tasks/api";
import { deleteSection, renameSection } from "@/lib/tasks/mutations";
import { sectionPatchSchema } from "@/lib/validation/tasks";

type Context = { params: Promise<{ sectionId: string }> };

export async function PATCH(req: Request, context: Context) {
  const auth = await authorizeTasksApi(req, { write: true, routeKey: "sections-update" });
  if (auth instanceof Response) return auth;

  return guarded("rename section", async () => {
    const { sectionId } = await context.params;
    const body = await readBody(req, sectionPatchSchema);
    if (!body.ok) return body.response;
    return respond(await renameSection(auth.actor, sectionId, body.data.name));
  });
}

export async function DELETE(req: Request, context: Context) {
  const auth = await authorizeTasksApi(req, { write: true, routeKey: "sections-delete" });
  if (auth instanceof Response) return auth;

  return guarded("delete section", async () => {
    const { sectionId } = await context.params;
    return respond(await deleteSection(auth.actor, sectionId));
  });
}
