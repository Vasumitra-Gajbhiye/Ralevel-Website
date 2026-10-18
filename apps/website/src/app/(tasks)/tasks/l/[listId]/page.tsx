import { ListPage } from "@/components/tasks/ListPage";
import { getListPage } from "@/lib/data/tasks/lists";
import { requireTasksActor } from "@/lib/tasks/page";
import { notFound, redirect } from "next/navigation";

export default async function ListRoute({
  params,
  searchParams,
}: {
  params: Promise<{ listId: string }>;
  searchParams: Promise<{ view?: string; completed?: string; task?: string }>;
}) {
  const { actor, inboxId } = await requireTasksActor();
  const { listId } = await params;
  const { view, completed, task } = await searchParams;
  if (listId === inboxId) redirect(task ? `/tasks/inbox?task=${encodeURIComponent(task)}` : "/tasks/inbox");

  const data = await getListPage(actor, listId, { showCompleted: completed === "1" });
  if (!data) {
    // Someone assigned a task in a list they can't see (e.g. a Discord DM link): show just the task.
    if (task) redirect(`/tasks/my?task=${encodeURIComponent(task)}`);
    notFound();
  }
  return <ListPage data={data} view={view === "board" || view === "list" ? view : data.list.defaultView} />;
}
