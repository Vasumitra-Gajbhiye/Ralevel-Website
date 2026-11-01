import { addChangeRequestComment } from "@/lib/data/admin/resource-change-requests";
import { runRequestAction } from "@/lib/resource-cms/requests/route";
import { canComment } from "@/lib/resource-cms/requests/rules";
import { commentSchema } from "@/lib/validation/resource-change-requests";

export async function POST(req: Request, context: { params: Promise<{ number: string }> }) {
  return runRequestAction(req, context.params, {
    schema: commentSchema,
    allowed: () => canComment(),
    deniedMessage: "You can't comment on this request.",
    rateLimit: { routeKey: "admin-resource-change-request-comment", limit: 20, windowSec: 60 },
    run: ({ number, data, ctx }) =>
      addChangeRequestComment({ number, body: data.body, actor: ctx.actor }),
  });
}
