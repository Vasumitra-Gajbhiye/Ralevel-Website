import { ListPage } from "@/components/tasks/ListPage";
import { getListPage } from "@/lib/data/tasks/lists";
import { requireTasksActor } from "@/lib/tasks/page";
import { notFound } from "next/navigation";

export const metadata = { title: "Inbox · Tasks" };

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; completed?: string }>;
}) {
  const { actor, inboxId } = await requireTasksActor();
  const { view, completed } = await searchParams;
  const data = await getListPage(actor, inboxId, { showCompleted: completed === "1" });
  if (!data) notFound();
  return <ListPage data={data} view={view === "board" || view === "list" ? view : data.list.defaultView} />;
}
