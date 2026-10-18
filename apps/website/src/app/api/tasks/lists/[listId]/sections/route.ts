import { authorizeTasksApi, guarded, readBody, respond } from "@/lib/tasks/api";
import { createSection, reorderSections } from "@/lib/tasks/mutations";
import { orderedIdsSchema, sectionCreateSchema } from "@/lib/validation/tasks";

type Context = { params: Promise<{ listId: string }> };

export async function POST(req: Request, context: Context) {
  const auth = await authorizeTasksApi(req, { write: true, routeKey: "sections-create" });
  if (auth instanceof Response) return auth;

  return guarded("create section", async () => {
    const { listId } = await context.params;
    const body = await readBody(req, sectionCreateSchema);
    if (!body.ok) return body.response;
    return respond(await createSection(auth.actor, listId, body.data.name), 201);
  });
}

/** Reorder: { orderedIds } is the full section order. */
export async function PUT(req: Request, context: Context) {
  const auth = await authorizeTasksApi(req, { write: true, routeKey: "sections-reorder" });
  if (auth instanceof Response) return auth;

  return guarded("reorder sections", async () => {
    const { listId } = await context.params;
    const body = await readBody(req, orderedIdsSchema);
    if (!body.ok) return body.response;
    return respond(await reorderSections(auth.actor, listId, body.data.orderedIds));
  });
}
