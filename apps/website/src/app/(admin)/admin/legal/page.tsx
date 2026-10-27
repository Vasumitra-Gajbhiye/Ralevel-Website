import { guardSection } from "@/lib/admin-access/page-guard";
import { getAdminLegalPages } from "@/lib/data/admin/legalPages";
import LegalAdminClient from "./LegalAdminClient";

export default async function AdminLegalPage() {
  const denied = await guardSection("legal");
  if (denied) return denied;

  const pages = await getAdminLegalPages();
  return <LegalAdminClient initialPages={pages} />;
}
