import { TodayView } from "@/components/tasks/SmartViews";
import { getTodayView } from "@/lib/data/tasks/workspace";
import { requireTasksActor } from "@/lib/tasks/page";

export const metadata = { title: "Today · Tasks" };

export default async function TodayPage() {
  const { actor } = await requireTasksActor();
  const data = await getTodayView(actor);
  return <TodayView overdue={data.overdue} today={data.today} />;
}
