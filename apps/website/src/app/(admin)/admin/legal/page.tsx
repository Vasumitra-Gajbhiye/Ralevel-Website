import { getAdminLegalPages } from "@/lib/data/admin/legalPages";
import LegalAdminClient from "./LegalAdminClient";

export default async function AdminLegalPage() {
  const pages = await getAdminLegalPages();
  return <LegalAdminClient initialPages={pages} />;
}
