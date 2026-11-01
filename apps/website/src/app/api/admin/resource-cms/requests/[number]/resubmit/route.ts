import { resubmitChangeRequest } from "@/lib/data/admin/resource-change-requests";
import { runRequestAction } from "@/lib/resource-cms/requests/route";
import { canResubmit } from "@/lib/resource-cms/requests/rules";
import { optionalNoteSchema } from "@/lib/validation/resource-change-requests";

/** The author sends their revised draft back for review. */
export async function POST(req: Request, context: { params: Promise<{ number: string }> }) {
  return runRequestAction(req, context.params, {
    schema: optionalNoteSchema,
    allowed: (state, viewer) => canResubmit(state, viewer),
    deniedMessage: "Only the author can resubmit, after changes were requested.",
    run: ({ number, data, ctx }) =>
      resubmitChangeRequest({ number, note: data.note, actor: ctx.actor }),
  });
}
