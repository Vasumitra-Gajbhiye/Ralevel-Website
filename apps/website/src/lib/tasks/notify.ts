/** Discord DMs for /tasks, sent through the bot. Fire-and-forget. Server-only. */
import { notifyBotTaskAssigned } from "@/lib/discord/botClient";
import { normalizeSiteUrl } from "@/lib/discord/notifyFormSubmission";
import connectDB from "@/lib/mongodb";
import { isStaff, sanitizeRoles } from "@/lib/roles";
import UserData from "@/models/userData";
import { formatDue, istTodayKey } from "./dates";
import { getDepartment } from "./departments";

type AssignedTask = {
  _id: unknown;
  title: string;
  listId: unknown;
  dueOn?: string | null;
  dueAt?: Date | null;
  priority?: number;
};

export function taskUrl(listId: unknown, taskId: unknown): string {
  return `${normalizeSiteUrl(process.env.NEXT_PUBLIC_URL)}/tasks/l/${String(listId)}?task=${String(taskId)}`;
}

export async function notifyTaskAssigned(input: {
  task: AssignedTask;
  list: { name: string; departmentKey?: string | null };
  assigneeId: string;
  actorId: string;
}): Promise<void> {
  if (input.assigneeId === input.actorId) return;
  await connectDB();
  const [assignee, actor] = await Promise.all([
    UserData.findById(input.assigneeId).select("discordUserId roles").lean<{ discordUserId?: string; roles?: string[] }>(),
    UserData.findById(input.actorId).select("name email").lean<{ name?: string; email: string }>(),
  ]);
  const discordUserId = assignee?.discordUserId?.trim();
  if (!discordUserId || !isStaff(sanitizeRoles(assignee?.roles))) return;

  const { task, list } = input;
  await notifyBotTaskAssigned({
    discordUserId,
    taskTitle: task.title,
    listName: list.name,
    departmentName: list.departmentKey ? getDepartment(list.departmentKey)?.name ?? null : null,
    assignedBy: actor?.name || actor?.email.split("@")[0] || "Someone",
    dueLabel: task.dueOn ? formatDue(task.dueOn, task.dueAt ?? null, istTodayKey()) : null,
    priority: (task.priority ?? 4) as 1 | 2 | 3 | 4,
    url: taskUrl(task.listId, task._id),
  });
}
