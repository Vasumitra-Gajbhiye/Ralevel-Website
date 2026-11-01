import {
  getOpenChangeRequest,
  restoreChangeRequest,
} from "@/lib/data/admin/resource-change-requests";
import { runRequestAction } from "@/lib/resource-cms/requests/route";
import { canRestore } from "@/lib/resource-cms/requests/rules";
import { optionalNoteSchema } from "@/lib/validation/resource-change-requests";

/** Put a rejected or withdrawn request's content back into the draft. */
export async function POST(req: Request, context: { params: Promise<{ number: string }> }) {
  return runRequestAction(req, context.params, {
    schema: optionalNoteSchema,
    allowed: async (state, viewer) =>
      canRestore(state, viewer, !!(await getOpenChangeRequest(state.slug))),
    deniedMessage:
      "Only the author or a publisher can restore this, and only while no other request is open on the subject.",
    run: ({ number, ctx }) => restoreChangeRequest({ number, actor: ctx.actor }),
  });
}
