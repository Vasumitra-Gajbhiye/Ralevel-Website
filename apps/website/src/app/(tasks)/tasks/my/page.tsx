import { MyTasksView } from "@/components/tasks/SmartViews";
import { getMyTasksView } from "@/lib/data/tasks/workspace";
import { requireTasksActor } from "@/lib/tasks/page";

export const metadata = { title: "My tasks · Tasks" };

export default async function MyTasksPage() {
  const { actor } = await requireTasksActor();
  const data = await getMyTasksView(actor);
  return <MyTasksView tasks={data.tasks} />;
}
