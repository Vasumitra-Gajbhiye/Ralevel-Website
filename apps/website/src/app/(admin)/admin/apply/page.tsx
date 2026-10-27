import { guardSection } from "@/lib/admin-access/page-guard";
import { getAdminApplyCards } from "@/lib/data/admin/applyCards";
import ApplyAdminClient from "./ApplyAdminClient";

export default async function AdminApplyPage() {
  const denied = await guardSection("apply");
  if (denied) return denied;

  const cards = await getAdminApplyCards();
  return <ApplyAdminClient initialCards={cards} />;
}
