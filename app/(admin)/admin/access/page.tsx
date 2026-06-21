import { getAuthSession } from "@/lib/getAuthSession";
import AdminAccessClient from "./AdminAccessClient";

export default async function AccessPage() {
  const session = await getAuthSession();

  return <AdminAccessClient session={session} />;
}
