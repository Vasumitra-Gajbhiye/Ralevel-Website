import { DepartmentView } from "@/components/tasks/DepartmentView";
import { getDepartmentPage } from "@/lib/data/tasks/lists";
import { requireTasksActor } from "@/lib/tasks/page";
import { notFound } from "next/navigation";

export default async function DepartmentPage({ params }: { params: Promise<{ dept: string }> }) {
  const { actor } = await requireTasksActor();
  const { dept } = await params;
  const data = await getDepartmentPage(actor, dept);
  if (!data) notFound();
  return <DepartmentView data={data} />;
}
