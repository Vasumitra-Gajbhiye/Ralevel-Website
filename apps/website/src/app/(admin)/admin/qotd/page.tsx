import { guardSection } from "@/lib/admin-access/page-guard";
import { getModOrder } from "./actions";
import QotdClient from "./qotdClient";

export default async function QotdPage() {
  const denied = await guardSection("qotd");
  if (denied) return denied;

  const initialMods = await getModOrder();

  return (
    <main className="min-h-screen bg-gray-50/30 py-12">
      <QotdClient initialMods={initialMods} />
    </main>
  );
}
