import { rejectChangeRequest } from "@/lib/data/admin/resource-change-requests";
import { runRequestAction } from "@/lib/resource-cms/requests/route";
import { canReject } from "@/lib/resource-cms/requests/rules";
import { requiredNoteSchema } from "@/lib/validation/resource-change-requests";

/** Close the request and reset the subject's draft to the live page. */
export async function POST(req: Request, context: { params: Promise<{ number: string }> }) {
  return runRequestAction(req, context.params, {
    schema: requiredNoteSchema,
    allowed: (state, viewer) => canReject(state, viewer),
    deniedMessage: "Only someone with Resource publishing access can reject a request.",
    run: ({ number, data, ctx }) =>
      rejectChangeRequest({ number, note: data.note, actor: ctx.actor }),
  });
}
