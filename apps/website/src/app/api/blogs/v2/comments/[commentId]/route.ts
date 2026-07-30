import { deleteComment } from "@/lib/data/blogV2Comments";
import { enforceSameOrigin } from "@/lib/csrf";
import { getAuthSession } from "@/lib/getAuthSession";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ commentId: string }> },
) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  const { commentId } = await context.params;

  try {
    await deleteComment(
      commentId,
      session.userData.id,
      session.userData.roles,
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete";
    const statusCode =
      err instanceof Error && "statusCode" in err
        ? (err as Error & { statusCode: number }).statusCode
        : message === "Forbidden"
          ? 403
          : message === "Comment not found"
            ? 404
            : 400;

    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
