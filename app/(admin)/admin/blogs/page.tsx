import { getAuthSession } from "@/lib/getAuthSession";
import AdminBlogsClient from "./AdminBlogsClient";

export default async function AdminBlogsPage() {
  const session = await getAuthSession();

  return <AdminBlogsClient session={session} />;
}
