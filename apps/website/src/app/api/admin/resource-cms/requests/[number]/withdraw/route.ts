import { withdrawChangeRequest } from "@/lib/data/admin/resource-change-requests";
import { runRequestAction } from "@/lib/resource-cms/requests/route";
import { canWithdraw } from "@/lib/resource-cms/requests/rules";
import { optionalNoteSchema } from "@/lib/validation/resource-change-requests";

/** The author closes their own request; the draft is left as it is. */
export async function POST(req: Request, context: { params: Promise<{ number: string }> }) {
  return runRequestAction(req, context.params, {
    schema: optionalNoteSchema,
    allowed: (state, viewer) => canWithdraw(state, viewer),
    deniedMessage: "Only the author can withdraw a request.",
    run: ({ number, data, ctx }) =>
      withdrawChangeRequest({ number, note: data.note, actor: ctx.actor }),
  });
}
