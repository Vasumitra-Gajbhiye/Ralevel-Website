import { UpcomingView } from "@/components/tasks/SmartViews";
import { getUpcomingView } from "@/lib/data/tasks/workspace";
import { requireTasksActor } from "@/lib/tasks/page";

export const metadata = { title: "Upcoming · Tasks" };

export default async function UpcomingPage() {
  const { actor } = await requireTasksActor();
  const data = await getUpcomingView(actor);
  return <UpcomingView overdue={data.overdue} days={data.days} />;
}
