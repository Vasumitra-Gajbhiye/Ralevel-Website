import { redirect } from "next/navigation";

export default function TasksHome() {
  redirect("/tasks/today");
}
