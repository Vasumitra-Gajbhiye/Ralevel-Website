import { requestChanges } from "@/lib/data/admin/resource-change-requests";
import { runRequestAction } from "@/lib/resource-cms/requests/route";
import { canRequestChanges } from "@/lib/resource-cms/requests/rules";
import { requiredNoteSchema } from "@/lib/validation/resource-change-requests";

/** Send the request back to its author with a note. */
export async function POST(req: Request, context: { params: Promise<{ number: string }> }) {
  return runRequestAction(req, context.params, {
    schema: requiredNoteSchema,
    allowed: (state, viewer) => canRequestChanges(state, viewer),
    deniedMessage: "Only someone with Resource publishing access can request changes.",
    run: ({ number, data, ctx }) =>
      requestChanges({ number, note: data.note, actor: ctx.actor }),
  });
}
