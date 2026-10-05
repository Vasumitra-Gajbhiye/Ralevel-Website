/**
 * pnpm db:seed-fake
 *
 * Fills the personal-data collections in the LOCAL dev database (ralevel_dev)
 * with fake people, so admin pages that list users, submissions, appeals etc.
 * have something to show. Those collections are never copied from production.
 *
 * Run it after `pnpm db:restore` / `pnpm db:reset`: form submissions,
 * scholarship saves and blog comments are attached to the seeded forms,
 * scholarships and blogs. Re-running replaces all fake data. Anything you
 * created yourself in these collections is deleted too.
 *
 * Refuses to run unless MONGODB_URI is the local dev database.
 */
import type { Model } from "mongoose";

import { resolveLocalMongoUri } from "../../../scripts/db/guard";

const PEOPLE = [
  "Aisha Khan", "Ben Carter", "Chen Wei", "Diya Patel", "Ethan Brooks",
  "Fatima Noor", "Gabriel Silva", "Hana Sato", "Ibrahim Ali", "Julia Novak",
  "Kofi Mensah", "Lina Haddad",
].map((name, i) => {
  const [first, last] = name.split(" ");
  const handle = `${first}${last[0]}`.toLowerCase();
  return {
    name,
    first,
    handle,
    email: `${first}.${last}@example.com`.toLowerCase(),
    clerkId: `user_seed${String(i + 1).padStart(3, "0")}`,
    discordId: `1000000000000000${String(i + 1).padStart(2, "0")}`,
  };
});

const ROLES_BY_PERSON: string[][] = [
  ["admin"], ["senior_mod"], ["junior_mod"], ["writer"], ["senior_writer"],
  ["scholarship_staff"], ["resource_staff"], ["helper"], ["graphic_designer"],
];

const pick = <T,>(items: readonly T[], i: number): T => items[i % items.length];
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);

async function main() {
  resolveLocalMongoUri();

  // Imported after the guard: lib/mongodb reads MONGODB_URI at import time.
  const { default: connectDB } = await import("../src/lib/mongodb");
  const { default: mongoose } = await import("mongoose");
  const m = {
    UserData: (await import("../src/models/userData")).default,
    Form: (await import("../src/models/Form")).default,
    FormSubmission: (await import("../src/models/FormSubmission")).default,
    DiscordAppealSubmission: (await import("../src/models/DiscordAppealSubmission")).default,
    DiscordAppealBan: (await import("../src/models/DiscordAppealBan")).default,
    Donor: (await import("../src/models/Donor")).Donor,
    Contributor: (await import("../src/models/Contributor")).default,
    ResourceSubmission: (await import("../src/models/ResourceSubmission")).default,
    Scholarship: (await import("../src/models/scholarship")).default,
    ScholarshipSave: (await import("../src/models/scholarshipSave")).default,
    ScholarshipSubmission: (await import("../src/models/scholarshipSubmission")).default,
    BlogV2: (await import("../src/models/blogV2")).default,
    BlogV2Comment: (await import("../src/models/blogV2Comment")).default,
    BlogV2Like: (await import("../src/models/blogV2Like")).default,
    BlogV2CommentLike: (await import("../src/models/blogV2CommentLike")).default,
    StaffMember: (await import("../src/models/staffMember")).default,
    HelperMember: (await import("../src/models/helperMember")).default,
    GraphicMember: (await import("../src/models/graphicMember")).default,
    InformativeMember: (await import("../src/models/informativeMember")).default,
    CertData: (await import("../src/models/certsData")).default,
  };

  await connectDB();
  console.log(`Seeding fake data into ${mongoose.connection.name}...`);

  const personal = [
    m.UserData, m.FormSubmission, m.DiscordAppealSubmission, m.DiscordAppealBan,
    m.Donor, m.Contributor, m.ResourceSubmission, m.ScholarshipSave,
    m.ScholarshipSubmission, m.BlogV2Comment, m.BlogV2Like, m.BlogV2CommentLike,
    m.StaffMember, m.HelperMember, m.GraphicMember, m.InformativeMember, m.CertData,
  ];
  for (const model of personal) await model.deleteMany({});

  const counts: Record<string, number> = {};
  const insert = async (model: Model<any>, docs: object[]) => {
    const created = docs.length ? await model.insertMany(docs) : [];
    counts[model.collection.collectionName] = created.length;
    return created;
  };

  // Users
  const users = await insert(
    m.UserData,
    PEOPLE.map((p, i) => ({
      name: p.name,
      email: p.email,
      nickname: p.handle,
      roles: ROLES_BY_PERSON[i] ?? [],
      boards: ["CAIE"],
      subjectsAS: ["Physics", "Mathematics"],
      redditUsername: `u_${p.handle}`,
      discordUsername: p.handle,
      discordUserId: p.discordId,
      examSession: [pick(["May/June 2027", "Oct/Nov 2026"], i)],
      nationalities: [pick(["Pakistan", "India", "UK", "Nigeria", "UAE"], i)],
    }))
  );

  // Form submissions: a few per seeded form, with answers for every field.
  const forms = await m.Form.find().limit(5).lean<any[]>();
  const submissions: object[] = [];
  forms.forEach((form, f) => {
    for (let s = 0; s < 4; s++) {
      const p = PEOPLE[(f * 4 + s) % PEOPLE.length];
      const responses: Record<string, unknown> = {};
      for (const section of form.sections ?? []) {
        for (const field of section.fields ?? []) {
          responses[field.id] = fakeAnswer(field, p);
        }
      }
      submissions.push({
        formSlug: form.slug,
        formType: form.formType ?? form.slug,
        cycleId: form.cycleId ?? 1,
        responses,
        submittedAt: daysAgo(s * 3 + f),
        submitterName: p.name,
        submitterEmail: p.email,
        sessionEmail: p.email,
        votes: s % 2 ? [{ adminId: PEOPLE[0].clerkId, adminName: PEOPLE[0].name, vote: 1 }] : [],
        comments: s === 0 ? [{ adminId: PEOPLE[0].clerkId, adminName: PEOPLE[0].name, message: "Looks promising." }] : [],
      });
    }
  });
  if (!forms.length) console.warn("  No forms found: restore the seed archive first for form submissions.");
  await insert(m.FormSubmission, submissions);

  // Discord appeals and bans
  await insert(
    m.DiscordAppealSubmission,
    PEOPLE.slice(0, 6).map((p, i) => ({
      discordUserId: p.discordId,
      discordUsername: p.handle,
      submitterEmail: p.email,
      submitterName: p.name,
      clerkUserId: p.clerkId,
      appealType: pick(["ban", "warning", "timeout"] as const, i),
      responses: {
        q1: "I posted answers during a live exam session.",
        q2: "I understand that breaks the academic honesty rules.",
        q3: "I will only discuss papers after the embargo ends.",
      },
      status: pick(["pending", "pending", "approved", "rejected"] as const, i),
      submittedAt: daysAgo(i * 2),
    }))
  );
  await insert(
    m.DiscordAppealBan,
    PEOPLE.slice(0, 3).map((p) => ({ discordUserId: p.discordId, reason: "Sharing exam content (fake)" }))
  );

  // Donors
  await insert(
    m.Donor,
    PEOPLE.slice(0, 5).map((p, i) => ({
      userEmail: p.email,
      amount: pick([5, 10, 25], i),
      tierLabel: pick(["Supporter", "Champion", "Patron"], i),
      transactionId: `seed_txn_${i + 1}`,
      stripeSessionId: `cs_test_seed_${i + 1}`,
      isClaimed: i % 2 === 0,
    }))
  );

  // Resource contributors and their submissions
  const contributors = await insert(
    m.Contributor,
    PEOPLE.slice(4, 8).map((p, i) => ({
      fullName: p.name,
      email: p.email,
      discordOrRedditId: p.handle,
      totalSubmissions: i + 1,
    }))
  );
  await insert(
    m.ResourceSubmission,
    contributors.map((c, i) => ({
      contributorId: c._id,
      status: pick(["pending", "approved", "rejected"] as const, i),
      resources: [
        {
          title: pick(["Physics P2 topical notes", "Pure Maths 1 formula sheet", "Chemistry organic map"], i),
          description: "Fake resource for local development.",
          resourceType: "Links",
          levels: ["AS"],
          boards: ["CAIE"],
          madeByMe: true,
          links: ["https://example.com/resource.pdf"],
          status: pick(["pending", "approved", "rejected"] as const, i),
        },
      ],
    }))
  );

  // Scholarship saves and community submissions
  const scholarships = await m.Scholarship.find().limit(4).select("_id title").lean<any[]>();
  await insert(
    m.ScholarshipSave,
    scholarships.flatMap((s, i) =>
      users.slice(0, 3).map((u, j) => ({
        userId: u._id,
        scholarshipId: s._id,
        status: pick(["saved", "preparing", "applied", "awarded", "rejected"] as const, i + j),
      }))
    )
  );
  await insert(m.ScholarshipSubmission, [
    ...PEOPLE.slice(0, 2).map((p, i) => ({
      kind: "new",
      title: `Fake Foundation Scholarship ${i + 1}`,
      url: "https://example.com/scholarship",
      deadline: "2027-01-31",
      submittedBy: { userId: p.clerkId, email: p.email },
    })),
    ...scholarships.slice(0, 2).map((s, i) => ({
      kind: "correction",
      scholarshipId: s._id,
      title: s.title ?? "Scholarship correction",
      notes: "The deadline on the official site has moved.",
      submittedBy: { userId: PEOPLE[i + 2].clerkId, email: PEOPLE[i + 2].email },
    })),
  ]);

  // Blog comments and likes on published blogs
  const blogs = await m.BlogV2.find({ status: "published", slug: { $nin: [null, ""] } })
    .limit(3)
    .select("slug")
    .lean<any[]>();
  const comments = await insert(
    m.BlogV2Comment,
    blogs.flatMap((b, i) =>
      users.slice(0, 3).map((u, j) => ({
        blogSlug: b.slug,
        userId: u._id,
        authorName: u.name,
        body: pick(["This helped a lot, thanks!", "Could you cover paper 4 next?", "Great summary."], i + j),
      }))
    )
  );
  await insert(
    m.BlogV2Like,
    blogs.flatMap((b) => users.slice(0, 5).map((u) => ({ blogSlug: b.slug, userId: u._id })))
  );
  await insert(
    m.BlogV2CommentLike,
    comments.slice(0, 3).map((c, i) => ({ commentId: c._id, userId: users[i + 5]._id }))
  );

  // Team rosters (admin/team) and certificates
  const member = (p: (typeof PEOPLE)[number]) => ({ username: p.handle, userId: p.discordId, email: p.email });
  await insert(
    m.StaffMember,
    PEOPLE.slice(0, 6).map((p, i) => ({
      ...member(p),
      realName: p.name,
      rank: pick(["admin", "senior_mod", "junior_mod", "trial_mod"] as const, i),
      positionStart: daysAgo(400 - i * 30),
      notes: "Fake staff record.",
    }))
  );
  await insert(
    m.HelperMember,
    PEOPLE.slice(6, 10).map((p, i) => ({ ...member(p), rank: pick(["junior_helper", "senior_helper"] as const, i) }))
  );
  await insert(
    m.GraphicMember,
    PEOPLE.slice(8, 11).map((p, i) => ({ ...member(p), positionStart: daysAgo(200), resourceSubmissions: i }))
  );
  await insert(
    m.InformativeMember,
    PEOPLE.slice(9, 12).map((p) => ({ ...member(p), positionStart: daysAgo(100) }))
  );
  await insert(
    m.CertData,
    PEOPLE.slice(0, 5).map((p, i) => ({
      name: p.name,
      certType: pick(["helper", "resource"], i),
      certId: `SEED-${String(i + 1).padStart(4, "0")}`,
      issueDate: daysAgo(60 + i),
      owner: p.name,
      email: p.email,
      discordUserId: p.discordId,
      certificateDesigned: true,
      certificateDelivered: i % 2 === 0,
      revoked: false,
    }))
  );

  for (const [name, n] of Object.entries(counts)) console.log(`  ${name}: ${n}`);
  console.log("✅ Fake data ready.");
  await mongoose.disconnect();
}

function fakeAnswer(field: { type: string; options?: string[]; multiple?: boolean }, p: (typeof PEOPLE)[number]) {
  switch (field.type) {
    case "email":
      return p.email;
    case "url":
      return "https://example.com";
    case "select":
    case "radio":
      if (!field.options?.length) return "";
      return field.multiple ? field.options.slice(0, 2) : field.options[0];
    case "checkbox":
      return field.options?.length ? field.options.slice(0, 1) : true;
    case "file":
      return [];
    case "textarea":
      return `${p.first} is a fake applicant used for local development. This answer is placeholder text.`;
    default:
      return p.name;
  }
}

main().catch(async (err) => {
  console.error(`❌ ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
