import { revalidateDataTags } from "@/lib/data-cache";
import { approveChangeRequest } from "@/lib/data/admin/resource-change-requests";
import { runRequestAction } from "@/lib/resource-cms/requests/route";
import { canApprove } from "@/lib/resource-cms/requests/rules";
import { approveSchema } from "@/lib/validation/resource-change-requests";

/** Approve and publish the version the reviewer looked at. */
export async function POST(req: Request, context: { params: Promise<{ number: string }> }) {
  return runRequestAction(req, context.params, {
    schema: approveSchema,
    allowed: (state, viewer) => canApprove(state, viewer),
    deniedMessage: "Only someone with Resource publishing access can approve, and not their own request.",
    run: async ({ number, data, ctx }) => {
      const result = await approveChangeRequest({
        number,
        expectedHash: data.expectedHash,
        note: data.note,
        actor: ctx.actor,
      });
      revalidateDataTags("resources", `resource:${result.slug}`);
      return result;
    },
  });
}
