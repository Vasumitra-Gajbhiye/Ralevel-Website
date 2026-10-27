/** Discord DMs for /tasks, sent through the bot. Fire-and-forget. Server-only. */
import { notifyBotTaskAssigned, notifyBotTaskEvent, type TaskEventPayload } from "@/lib/discord/botClient";
import { normalizeSiteUrl } from "@/lib/discord/notifyFormSubmission";
import connectDB from "@/lib/mongodb";
import { isStaff, sanitizeRoles, type Role } from "@/lib/roles";
import UserData from "@/models/userData";
import { formatDue, istTodayKey } from "./dates";
import { getDepartment } from "./departments";
import { STARS_PER_CERTIFICATE, certificatesEarned, starsTowardNext } from "./stars";

type AssignedTask = {
  _id: unknown;
  title: string;
  listId: unknown;
  dueOn?: string | null;
  dueAt?: Date | null;
  priority?: number;
};

const siteUrl = () => normalizeSiteUrl(process.env.NEXT_PUBLIC_URL);

export function taskUrl(listId: unknown, taskId: unknown): string {
  return `${siteUrl()}/tasks/l/${String(listId)}?task=${String(taskId)}`;
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

/* ------------------------- Review and reward DMs ------------------------- */

type ReviewTask = { _id: unknown; title: string; listId: unknown; stars?: number };
type ReviewList = { name: string; departmentKey?: string | null };

type UserRow = { _id: unknown; name?: string; email: string; discordUserId?: string; roles?: string[] };

const displayName = (u: Pick<UserRow, "name" | "email"> | null | undefined) =>
  u?.name?.trim() || u?.email.split("@")[0] || "Someone";

function whereOf(list: ReviewList): string {
  const dept = list.departmentKey ? getDepartment(list.departmentKey)?.name : null;
  return dept ? `${dept} · ${list.name}` : list.name;
}

/** Discord ids of current staff matching `filter`, minus `exceptUserId`. */
async function discordIdsOf(filter: Record<string, unknown>, exceptUserId?: string): Promise<string[]> {
  const users = await UserData.find(filter).select("discordUserId roles").lean<UserRow[]>();
  return users
    .filter((u) => String(u._id) !== exceptUserId && isStaff(sanitizeRoles(u.roles)))
    .map((u) => u.discordUserId?.trim())
    .filter((id): id is string => Boolean(id));
}

/** The department's heads, or owners/admins when it has no head role (General, Bot Dev). */
async function headDiscordIds(departmentKey: string | null | undefined, exceptUserId?: string): Promise<string[]> {
  const headRoles: readonly Role[] = (departmentKey && getDepartment(departmentKey)?.headRoles) || [];
  const roles = headRoles.length ? headRoles : (["owner", "admin"] as const);
  return discordIdsOf({ roles: { $in: [...roles] } }, exceptUserId);
}

async function send(discordUserIds: string[], event: TaskEventPayload["event"]) {
  await notifyBotTaskEvent({ discordUserIds, event });
}

async function userById(id: string) {
  return UserData.findById(id).select("name email discordUserId roles").lean<UserRow>();
}

export async function notifyReviewRequested(input: {
  task: ReviewTask;
  list: ReviewList;
  submitterId: string;
  note: string;
  link: string | null;
}): Promise<void> {
  await connectDB();
  const [recipients, submitter] = await Promise.all([
    headDiscordIds(input.list.departmentKey, input.submitterId),
    userById(input.submitterId),
  ]);
  await send(recipients, {
    kind: "review_requested",
    taskTitle: input.task.title,
    where: whereOf(input.list),
    submittedBy: displayName(submitter),
    stars: input.task.stars ?? 0,
    note: input.note,
    link: input.link,
    url: taskUrl(input.task.listId, input.task._id),
  });
}

export async function notifyApproved(input: {
  task: ReviewTask;
  list: ReviewList;
  assigneeId: string;
  reviewerId: string;
  stars: number;
  before: number;
  after: number;
}): Promise<void> {
  if (input.assigneeId === input.reviewerId) return;
  await connectDB();
  const [assignee, reviewer] = await Promise.all([userById(input.assigneeId), userById(input.reviewerId)]);
  const discordUserId = assignee?.discordUserId?.trim();
  if (!discordUserId || !isStaff(sanitizeRoles(assignee?.roles))) return;
  await send([discordUserId], {
    kind: "approved",
    taskTitle: input.task.title,
    where: whereOf(input.list),
    reviewedBy: displayName(reviewer),
    stars: input.stars,
    totalStars: input.after,
    towardNext: starsTowardNext(input.after),
    perCertificate: STARS_PER_CERTIFICATE,
    earnedCertificate: certificatesEarned(input.after) > certificatesEarned(input.before),
    url: taskUrl(input.task.listId, input.task._id),
  });
}

export async function notifyChangesRequested(input: {
  task: ReviewTask;
  list: ReviewList;
  assigneeId: string;
  reviewerId: string;
  comment: string;
}): Promise<void> {
  if (input.assigneeId === input.reviewerId) return;
  await connectDB();
  const [assignee, reviewer] = await Promise.all([userById(input.assigneeId), userById(input.reviewerId)]);
  const discordUserId = assignee?.discordUserId?.trim();
  if (!discordUserId || !isStaff(sanitizeRoles(assignee?.roles))) return;
  await send([discordUserId], {
    kind: "changes_requested",
    taskTitle: input.task.title,
    where: whereOf(input.list),
    reviewedBy: displayName(reviewer),
    comment: input.comment,
    url: taskUrl(input.task.listId, input.task._id),
  });
}

/** Tells the department's heads and the owner that someone reached a certificate. */
export async function notifyCertificateDue(input: {
  personId: string;
  departmentKey: string;
  totalStars: number;
}): Promise<void> {
  await connectDB();
  const dept = getDepartment(input.departmentKey);
  if (!dept) return;
  const [heads, owners, person] = await Promise.all([
    headDiscordIds(input.departmentKey, input.personId),
    discordIdsOf({ roles: "owner" }, input.personId),
    userById(input.personId),
  ]);
  await send([...new Set([...heads, ...owners])], {
    kind: "certificate_due",
    personName: displayName(person),
    departmentName: dept.name,
    totalStars: input.totalStars,
    url: `${siteUrl()}/tasks/d/${dept.key}`,
  });
}
