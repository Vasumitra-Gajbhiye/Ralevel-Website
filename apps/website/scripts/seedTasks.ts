/**
 * pnpm db:seed-tasks [--me you@example.com]
 *
 * Fills the /tasks collections in the LOCAL dev database (ralevel_dev) with
 * demo lists, sections, tasks, subtasks and comments for every department, so
 * each role can be checked with the dev "view as" switcher.
 *
 * - Adds a few demo users for roles the fake seed doesn't cover (department
 *   heads, bot_dev, informative_team, reddit_dep_head, former_staff).
 * - Wipes and re-creates ONLY the task collections.
 * - `--me <email>` also assigns some tasks to your own local user.
 *
 * Run after `pnpm db:seed-fake`. Refuses to run unless MONGODB_URI is the
 * local dev database.
 */
import { resolveLocalMongoUri } from "../../../scripts/db/guard";

const DEMO_USERS = [
  { name: "Maya Rao", nickname: "mayar", roles: ["mod_dep_head"] },
  { name: "Omar Farouk", nickname: "omarf", roles: ["writer_dep_head"] },
  { name: "Priya Nair", nickname: "priyan", roles: ["scholarship_dep_head"] },
  { name: "Rina Das", nickname: "rinad", roles: ["reddit_dep_head"] },
  { name: "Tom Becker", nickname: "tomb", roles: ["bot_dev"] },
  { name: "Zara Ahmed", nickname: "zaraa", roles: ["informative_team"] },
  { name: "Leo Park", nickname: "leop", roles: ["former_staff"] },
  { name: "Nadia Hussain", nickname: "nadiah", roles: ["resource_dep_head"] },
  { name: "Sam Okafor", nickname: "samo", roles: ["resource_staff"] },
].map((u) => ({ ...u, email: `${u.nickname}.tasks-demo@example.com` }));

type Seed = {
  title: string;
  /** Days from today (IST); null = no date. */
  due?: number | null;
  time?: string;
  priority?: 1 | 2 | 3 | 4;
  /** Index into the department's members (heads first); null = unassigned. */
  assignee?: number | null;
  section?: number;
  description?: string;
  recurrence?: Record<string, unknown>;
  subtasks?: [string, boolean][];
  comments?: [number, string][];
  done?: boolean;
  /** Star reward; done + assignee also writes the award. */
  stars?: 1 | 2 | 3;
  claimable?: boolean;
  submission?: { state: "submitted" | "changes_requested"; link?: string; note?: string };
};

type ListSeed = { name: string; color: string; view?: "list" | "board"; sections: string[]; tasks: Seed[] };

const LISTS: Record<string, ListSeed[]> = {
  general: [
    {
      name: "Staff announcements",
      color: "slate",
      sections: [],
      tasks: [
        { title: "Read the updated staff handbook", due: 3, priority: 2, description: "Pinned in #staff-info. Ask in comments if anything is unclear." },
        { title: "Fill in the exam-season availability form", due: 1, priority: 1 },
        { title: "Monthly all-hands", due: 6, time: "19:30", recurrence: { freq: "month", interval: 1 } },
      ],
    },
  ],
  moderation: [
    {
      name: "Server upkeep",
      color: "blue",
      view: "board",
      sections: ["To do", "In progress", "Done this week"],
      tasks: [
        { title: "Review open mod-mail tickets", due: 0, priority: 1, assignee: 1, section: 0, recurrence: { freq: "day", interval: 1, workdays: true } },
        { title: "Clean up stale #help threads", due: -2, priority: 2, assignee: 2, section: 0, comments: [[2, "Halfway through, will finish tonight."]] },
        { title: "Draft AutoMod rules for exam leaks", due: 2, priority: 1, assignee: 0, section: 1, subtasks: [["List leak keywords", true], ["Test on staging server", false], ["Share with mods for review", false]] },
        { title: "Update #rules channel wording", due: null, priority: 3, section: 1, assignee: 2 },
        { title: "Weekly mod sync", due: 4, time: "18:00", section: 0, recurrence: { freq: "week", interval: 1 } },
        { title: "Audit inactive trial mods", due: 9, priority: 3, section: 0 },
        { title: "Archive old event channels", section: 2, done: true, assignee: 1 },
      ],
    },
  ],
  writers: [
    {
      name: "Blog calendar",
      color: "red",
      sections: ["Drafting", "Review"],
      tasks: [
        { title: "Physics 9702 revision guide", due: 5, priority: 2, assignee: 1, section: 0, subtasks: [["Outline", true], ["First draft", false]] },
        { title: "How to choose A Level subjects", due: -1, priority: 1, assignee: 2, section: 0, comments: [[0, "Can you add a section on uni requirements?"], [2, "Yes, adding it today."]] },
        { title: "Proofread Chemistry practical tips", due: 1, priority: 3, assignee: 0, section: 1 },
        { title: "Pitch next month's topics", due: 7, priority: 4 },
      ],
    },
  ],
  scholarships: [
    {
      name: "Verification queue",
      color: "violet",
      sections: [],
      tasks: [
        { title: "Verify Chevening deadline for 2027", due: 0, priority: 1, assignee: 1 },
        { title: "Check new community submissions", due: 2, priority: 2, assignee: 1, recurrence: { freq: "week", interval: 1 } },
        { title: "Add 5 scholarships for Pakistan", due: 10, priority: 3, assignee: 0 },
      ],
    },
  ],
  resources: [
    {
      name: "Notes upload",
      color: "teal",
      sections: ["Maths", "Sciences"],
      tasks: [
        { title: "Upload P3 integration notes", due: 3, assignee: 1, section: 0 },
        { title: "Fix broken Biology PDF links", due: -3, priority: 1, assignee: 1, section: 1 },
        { title: "Write 9709 P1 topical notes", due: 12, priority: 2, section: 0, stars: 2, claimable: true, description: "One PDF per topic, with worked examples." },
        { title: "Make an IGCSE Chemistry flashcard set", section: 1, stars: 1, claimable: true },
        { title: "Summarise organic reaction mechanisms", due: 6, section: 1, stars: 3, claimable: true },
        {
          title: "Check 9702 past paper links",
          due: 1,
          section: 1,
          stars: 1,
          claimable: true,
          assignee: 1,
          submission: { state: "submitted", link: "https://drive.google.com/drive/folders/demo", note: "All links checked; 3 replaced." },
        },
        {
          title: "Statistics S1 cheat sheet",
          due: 4,
          section: 0,
          stars: 2,
          assignee: 2,
          submission: { state: "changes_requested", link: "https://docs.google.com/document/d/demo" },
          comments: [[0, "Nice start! Please add the normal distribution table."]],
        },
        { title: "Upload Further Maths FP1 notes", section: 0, stars: 2, claimable: true, assignee: 1, done: true },
        { title: "Tidy the Physics resources page", section: 1, stars: 1, assignee: 1, done: true },
      ],
    },
  ],
  helpers: [
    { name: "Helper rota", color: "green", sections: [], tasks: [{ title: "Cover #maths-help on Saturday", due: 6, assignee: 1 }] },
  ],
  graphics: [
    { name: "Design requests", color: "pink", sections: [], tasks: [{ title: "Exam season banner", due: 4, priority: 2, assignee: 1 }] },
  ],
  informative: [
    { name: "Posts schedule", color: "amber", sections: [], tasks: [{ title: "Results day FAQ post", due: 2, priority: 2, assignee: 1 }] },
  ],
  reddit: [
    { name: "Subreddit", color: "orange", sections: [], tasks: [{ title: "Update sidebar wiki links", due: 1, assignee: 0 }] },
  ],
  botdev: [
    {
      name: "Bot backlog",
      color: "cyan",
      sections: [],
      tasks: [
        { title: "Add /tasks digest opt-out", due: 8, priority: 3, assignee: 1, description: "Let people mute the daily DM." },
        { title: "Rotate bot token", due: 14, priority: 2 },
      ],
    },
  ],
};

const INBOX_TASKS: Seed[] = [
  { title: "Reply to Discord DMs", due: 0, priority: 2 },
  { title: "Plan next week", due: 1 },
  { title: "Read the mod handbook again", due: null },
];

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  resolveLocalMongoUri();

  // Imported after the guard: lib/mongodb reads MONGODB_URI at import time.
  const { default: connectDB } = await import("../src/lib/mongodb");
  const { default: mongoose } = await import("mongoose");
  const { DEPARTMENTS, membersQuery, isHeadOf } = await import("../src/lib/tasks/departments");
  const { addDays, instantFromIst, istTodayKey } = await import("../src/lib/tasks/dates");
  const { normalizeRecurrence } = await import("../src/lib/tasks/recurrence");
  const { sanitizeRoles, isStaff } = await import("../src/lib/roles");
  const UserData = (await import("../src/models/userData")).default;
  const TaskList = (await import("../src/models/taskList")).default;
  const TaskSection = (await import("../src/models/taskSection")).default;
  const Task = (await import("../src/models/task")).default;
  const TaskComment = (await import("../src/models/taskComment")).default;
  const TaskActivity = (await import("../src/models/taskActivity")).default;
  const TaskStarAward = (await import("../src/models/taskStarAward")).default;
  const TaskStarCertificate = (await import("../src/models/taskStarCertificate")).default;

  await connectDB();
  console.log(`Seeding /tasks demo data into ${mongoose.connection.name}...`);

  for (const u of DEMO_USERS) {
    await UserData.updateOne(
      { email: u.email },
      { $set: { name: u.name, nickname: u.nickname, roles: u.roles }, $setOnInsert: { email: u.email } },
      { upsert: true },
    );
  }

  for (const model of [Task, TaskList, TaskSection, TaskComment, TaskActivity, TaskStarAward, TaskStarCertificate]) {
    await model.deleteMany({});
  }

  const today = istTodayKey();
  const meEmail = argValue("--me")?.toLowerCase();
  const me = meEmail ? await UserData.findOne({ email: meEmail }).select("_id").lean<{ _id: unknown }>() : null;
  if (meEmail && !me) console.warn(`  --me: no local user with email ${meEmail} (sign in once first). Skipping.`);

  type Person = { _id: unknown; roles: string[] };
  const counts = { lists: 0, sections: 0, tasks: 0, comments: 0, awards: 0 };

  const createTask = async (
    seed: Seed,
    base: { listId: unknown; departmentKey: string | null; ownerId: unknown; sectionIds: unknown[]; people: Person[] },
    order: number,
  ) => {
    const dueOn = seed.due === undefined || seed.due === null ? null : addDays(today, seed.due);
    const assignee = seed.assignee === undefined || seed.assignee === null ? null : base.people[seed.assignee % base.people.length];
    const creator = base.people[0]?._id ?? base.ownerId;
    const task = await Task.create({
      listId: base.listId,
      sectionId: seed.section === undefined ? null : base.sectionIds[seed.section] ?? null,
      parentId: null,
      departmentKey: base.departmentKey,
      ownerId: base.ownerId,
      title: seed.title,
      description: seed.description ?? "",
      assigneeId: assignee?._id ?? null,
      dueOn,
      dueAt: dueOn && seed.time ? instantFromIst(dueOn, seed.time) : null,
      recurrence: seed.recurrence && dueOn ? normalizeRecurrence(seed.recurrence as never, dueOn) : null,
      priority: seed.priority ?? 4,
      order: order * 1000,
      completedAt: seed.done ? new Date() : null,
      completedBy: seed.done ? assignee?._id ?? creator : null,
      commentCount: seed.comments?.length ?? 0,
      createdBy: creator,
      claimable: seed.claimable ?? false,
      stars: seed.stars ?? 0,
      submission: seed.submission
        ? { state: seed.submission.state, at: new Date(), link: seed.submission.link ?? null, note: seed.submission.note ?? "" }
        : seed.done && seed.stars && assignee
          ? { state: "approved", at: new Date(), link: null, note: "" }
          : null,
    });
    counts.tasks++;
    if (seed.done && seed.stars && assignee && base.departmentKey) {
      await TaskStarAward.create({
        userId: assignee._id,
        departmentKey: base.departmentKey,
        taskId: task._id,
        taskTitle: seed.title,
        stars: seed.stars,
        awardedBy: creator,
      });
      counts.awards++;
    }
    await TaskActivity.create({ taskId: task._id, listId: base.listId, actorId: creator, type: "created", data: { title: seed.title } });

    for (const [i, [title, done]] of (seed.subtasks ?? []).entries()) {
      await Task.create({
        listId: base.listId,
        sectionId: task.sectionId,
        parentId: task._id,
        departmentKey: base.departmentKey,
        ownerId: base.ownerId,
        title,
        order: (i + 1) * 1000,
        completedAt: done ? new Date() : null,
        createdBy: creator,
      });
      counts.tasks++;
    }
    for (const [who, body] of seed.comments ?? []) {
      await TaskComment.create({ taskId: task._id, authorId: base.people[who % base.people.length]._id, body });
      counts.comments++;
    }
  };

  for (const dept of DEPARTMENTS) {
    const all = await UserData.find(membersQuery(dept.key)).select("_id roles").lean<Person[]>();
    const staff = all.filter((p) => isStaff(sanitizeRoles(p.roles)));
    // Heads first, then members; admins only when nobody else is around.
    const heads = staff.filter((p) => isHeadOf(sanitizeRoles(p.roles), dept.key) && !p.roles.includes("admin") && !p.roles.includes("owner"));
    const members = staff.filter((p) => !heads.includes(p) && !p.roles.includes("admin") && !p.roles.includes("owner"));
    const admins = staff.filter((p) => p.roles.includes("admin") || p.roles.includes("owner"));
    let people: Person[] = [...(heads.length ? heads : admins.slice(0, 1)), ...members];
    if (me) people = [people[0] ?? (me as Person), me as Person, ...people.slice(1)];
    if (!people.length) people = admins;
    if (!people.length) continue;

    for (const [li, listSeed] of (LISTS[dept.key] ?? []).entries()) {
      const list = await TaskList.create({
        kind: "department",
        departmentKey: dept.key,
        name: listSeed.name,
        color: listSeed.color,
        defaultView: listSeed.view ?? "list",
        order: (li + 1) * 1000,
        createdBy: people[0]._id,
      });
      counts.lists++;
      const sectionIds: unknown[] = [];
      for (const [si, name] of listSeed.sections.entries()) {
        const section = await TaskSection.create({ listId: list._id, name, order: (si + 1) * 1000 });
        sectionIds.push(section._id);
        counts.sections++;
      }
      for (const [ti, seed] of listSeed.tasks.entries()) {
        await createTask(seed, { listId: list._id, departmentKey: dept.key, ownerId: null, sectionIds, people }, ti + 1);
      }
    }
  }

  // Inboxes for every current staff member.
  const everyone = await UserData.find({ "roles.0": { $exists: true } }).select("_id roles").lean<Person[]>();
  const staffUsers = everyone.filter((p) => isStaff(sanitizeRoles(p.roles)));
  if (me && !staffUsers.some((p) => String(p._id) === String(me._id))) staffUsers.push(me as Person);
  for (const person of staffUsers) {
    const inbox = await TaskList.create({ kind: "inbox", ownerId: person._id, name: "Inbox", createdBy: person._id });
    for (const [ti, seed] of INBOX_TASKS.entries()) {
      await createTask(seed, { listId: inbox._id, departmentKey: null, ownerId: person._id, sectionIds: [], people: [person] }, ti + 1);
    }
  }

  console.log(
    `  ${counts.lists} lists, ${counts.sections} sections, ${counts.tasks} tasks, ${counts.comments} comments, ${counts.awards} star awards, ${staffUsers.length} inboxes`,
  );
  console.log(`  Demo users: ${DEMO_USERS.map((u) => `${u.name} (${u.roles[0]})`).join(", ")}`);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
