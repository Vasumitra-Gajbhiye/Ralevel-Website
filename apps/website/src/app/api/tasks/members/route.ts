import { getListDoc } from "@/lib/data/tasks/lists";
import { getAssignableMembers } from "@/lib/data/tasks/members";
import { authorizeTasksApi, guarded, jsonError } from "@/lib/tasks/api";
import { canViewList } from "@/lib/tasks/permissions";
import { listScopeOf } from "@/lib/tasks/serialize";
import { NextResponse } from "next/server";

/** GET ?listId= — people the current user may assign in that list (empty if none). */
export async function GET(req: Request) {
  const auth = await authorizeTasksApi(req, { routeKey: "members" });
  if (auth instanceof Response) return auth;

  return guarded("list members", async () => {
    const listId = new URL(req.url).searchParams.get("listId") ?? "";
    const list = await getListDoc(listId);
    if (!list || !canViewList(auth.actor, listScopeOf(list))) return jsonError("Not found", 404);
    const data = await getAssignableMembers(auth.actor, listScopeOf(list));
    return NextResponse.json({ data });
  });
}
