import { getAdminApplyCards } from "@/lib/data/admin/applyCards";
import ApplyAdminClient from "./ApplyAdminClient";

export default async function AdminApplyPage() {
  const cards = await getAdminApplyCards();
  return <ApplyAdminClient initialCards={cards} />;
}
