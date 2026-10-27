import { authorizeTasksApi, guarded, readBody, respond } from "@/lib/tasks/api";
import { markCertificateIssued } from "@/lib/tasks/mutations";
import { certificateMarkSchema } from "@/lib/validation/tasks";

/** { userId, departmentKey, certId? }: owners and admins record an issued certificate. */
export async function POST(req: Request) {
  const auth = await authorizeTasksApi(req, { write: true, routeKey: "tasks-certificates" });
  if (auth instanceof Response) return auth;

  return guarded("mark certificate", async () => {
    const body = await readBody(req, certificateMarkSchema);
    if (!body.ok) return body.response;
    return respond(await markCertificateIssued(auth.actor, body.data), 201);
  });
}
