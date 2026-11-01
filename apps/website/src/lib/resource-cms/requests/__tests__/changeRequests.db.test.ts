// Runs the resource change-request flow against the local test Mongo
// (docker, port 27028). Opt-in:
//   RUN_DB_TESTS=1 pnpm exec vitest run src/lib/resource-cms
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Role } from "@/lib/roles";

const TEST_MONGODB_URI = "mongodb://127.0.0.1:27028/ralevel_test";
const enabled = process.env.RUN_DB_TESTS === "1";

const { session, revalidateDataTags } = vi.hoisted(() => ({
  session: { current: null as unknown },
  revalidateDataTags: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/rateLimit", () => ({ enforceRateLimit: async () => null }));
vi.mock("@/lib/csrf", () => ({ enforceSameOrigin: () => null }));
vi.mock("@/lib/getAuthSession", () => ({ getAuthSession: async () => session.current }));
vi.mock("@/lib/data-cache", () => ({
  revalidateDataTags,
  cachedQuery: (_key: string[], fn: () => Promise<unknown>) => fn(),
}));
// No saved page access: every section uses its registry defaults.
vi.mock("@/models/adminPageAccess", () => ({
  default: { findOne: () => ({ lean: () => Promise.resolve(null) }) },
}));

type Person = { id: string; email: string; name: string; roles: Role[] };
const STAFF_A: Person = { id: "0000000000000000000000a1", email: "a@test.dev", name: "Aisha", roles: ["resource_staff"] };
const STAFF_B: Person = { id: "0000000000000000000000b2", email: "b@test.dev", name: "Ben", roles: ["resource_staff"] };
const HEAD: Person = { id: "0000000000000000000000c3", email: "head@test.dev", name: "Maeve", roles: ["resource_dep_head"] };
const ADMIN: Person = { id: "0000000000000000000000d4", email: "admin@test.dev", name: "Admin", roles: ["admin"] };

const as = (p: Person) => {
  session.current = {
    userId: `clerk_${p.id}`,
    user: { email: p.email, name: p.name, image: null },
    userData: { id: p.id, roles: p.roles, isOwner: false },
  };
};

const note = (n: number, extra: Record<string, unknown> = {}) => ({
  title: `Chapter ${n}`,
  source: "Test",
  link: `https://example.com/ch${n}`,
  tags: [],
  ...extra,
});

const sections = (notes: unknown[]) => ({
  syllabus: [],
  notes,
  worksheets: [],
  tools: [],
  books: [],
  youtubeChannel: [],
  youtubePlaylist: [],
});

const LIVE_NOTES = [note(1), note(2)];

describe.skipIf(!enabled)("Resource change requests (test database)", () => {
  let slugApi: typeof import("@/app/api/admin/resource-cms/[slug]/route");
  let publishApi: typeof import("@/app/api/admin/resource-cms/[slug]/publish/route");
  let restoreRevisionApi: typeof import("@/app/api/admin/resource-cms/[slug]/restore/route");
  let requestsApi: typeof import("@/app/api/admin/resource-cms/requests/route");
  let detailApi: typeof import("@/app/api/admin/resource-cms/requests/[number]/route");
  const actions: Record<string, { POST: (req: Request, ctx: { params: Promise<{ number: string }> }) => Promise<Response> }> = {};
  let models: {
    resources2Data: typeof import("@/models/resources2Data").default;
    Request: typeof import("@/models/resourceChangeRequest").default;
    Event: typeof import("@/models/resourceChangeRequestEvent").default;
    Revision: typeof import("@/models/resourceCmsRevision").default;
  };

  const url = (path: string) => `http://localhost/api/admin/resource-cms${path}`;
  const json = (method: string, path: string, body?: unknown) =>
    new Request(url(path), {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

  const saveDraft = (slug: string, notes: unknown[]) =>
    slugApi.PUT(json("PUT", `/${slug}`, sections(notes)), { params: Promise.resolve({ slug }) });
  const submit = (slug: string, title = "Add chapter 3") =>
    requestsApi.POST(json("POST", "/requests", { slug, title, description: "Please check" }));
  const detail = async (n: number) => {
    const res = await detailApi.GET(json("GET", `/requests/${n}`), { params: Promise.resolve({ number: String(n) }) });
    return res.json();
  };
  const act = (n: number, action: string, body: unknown = {}) =>
    actions[action].POST(json("POST", `/requests/${n}/${action}`, body), {
      params: Promise.resolve({ number: String(n) }),
    });
  const publish = (slug: string) =>
    publishApi.POST(json("POST", `/${slug}/publish`), { params: Promise.resolve({ slug }) });
  const subjectDoc = (slug: string) =>
    models.resources2Data.findOne({ slug }).lean<{
      notes: { title: string }[];
      draft: { notes: { title: string }[] };
      hasUnpublishedChanges: boolean;
    }>();

  async function seedSubject(slug: string) {
    await models.resources2Data.collection.deleteOne({ slug });
    await models.resources2Data.collection.insertOne({
      subject: `Subject ${slug}`,
      slug,
      level: "A-Level",
      ...sections(LIVE_NOTES),
      publishedAt: new Date(Date.now() - 60_000),
      hasUnpublishedChanges: false,
    });
  }

  async function clearAll() {
    await models.resources2Data.collection.deleteMany({ slug: /^cr-test/ });
    await models.Request.deleteMany({});
    await models.Event.deleteMany({});
    await models.Revision.deleteMany({ slug: /^cr-test/ });
  }

  /** Staff A edits `slug` and submits it; returns the request number. */
  async function openRequest(slug: string, notes = [...LIVE_NOTES, note(3)]) {
    as(STAFF_A);
    expect((await saveDraft(slug, notes)).status).toBe(200);
    const res = await submit(slug);
    expect(res.status).toBe(201);
    return (await res.json()).number as number;
  }

  beforeAll(async () => {
    process.env.MONGODB_URI = TEST_MONGODB_URI;
    slugApi = await import("@/app/api/admin/resource-cms/[slug]/route");
    publishApi = await import("@/app/api/admin/resource-cms/[slug]/publish/route");
    restoreRevisionApi = await import("@/app/api/admin/resource-cms/[slug]/restore/route");
    requestsApi = await import("@/app/api/admin/resource-cms/requests/route");
    detailApi = await import("@/app/api/admin/resource-cms/requests/[number]/route");
    actions.approve = await import("@/app/api/admin/resource-cms/requests/[number]/approve/route");
    actions["request-changes"] = await import("@/app/api/admin/resource-cms/requests/[number]/request-changes/route");
    actions.reject = await import("@/app/api/admin/resource-cms/requests/[number]/reject/route");
    actions.resubmit = await import("@/app/api/admin/resource-cms/requests/[number]/resubmit/route");
    actions.withdraw = await import("@/app/api/admin/resource-cms/requests/[number]/withdraw/route");
    actions.comments = await import("@/app/api/admin/resource-cms/requests/[number]/comments/route");
    actions.restore = await import("@/app/api/admin/resource-cms/requests/[number]/restore/route");

    const { default: connectDB } = await import("@/lib/mongodb");
    const conn = await connectDB();
    expect(conn.connection.host).toBe("127.0.0.1");
    expect(conn.connection.port).toBe(27028);

    models = {
      resources2Data: (await import("@/models/resources2Data")).default,
      Request: (await import("@/models/resourceChangeRequest")).default,
      Event: (await import("@/models/resourceChangeRequestEvent")).default,
      Revision: (await import("@/models/resourceCmsRevision")).default,
    };
    await models.Request.init();
    await clearAll();
  });

  beforeEach(async () => {
    revalidateDataTags.mockClear();
    await clearAll();
    await seedSubject("cr-test");
  });

  afterAll(async () => {
    if (!enabled) return;
    await clearAll();
    const mongoose = (await import("mongoose")).default;
    await mongoose.disconnect();
  });

  it("refuses to submit a draft that matches the live page", async () => {
    as(STAFF_A);
    const res = await submit("cr-test");
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("no_changes");
  });

  it("allows one open request per subject, even when two submit at once", async () => {
    await seedSubject("cr-test-race");
    as(STAFF_A);
    await saveDraft("cr-test-race", [...LIVE_NOTES, note(3)]);
    const [one, two] = await Promise.all([submit("cr-test-race"), submit("cr-test-race")]);
    expect([one.status, two.status].sort()).toEqual([201, 409]);
    expect(await models.Request.countDocuments({ slug: "cr-test-race", open: true })).toBe(1);
  });

  it("doesn't let publishers submit (they publish) and blocks a second request", async () => {
    const n = await openRequest("cr-test");
    as(STAFF_B);
    const second = await submit("cr-test");
    expect(second.status).toBe(409);
    expect((await second.json()).requestNumber).toBe(n);

    await seedSubject("cr-test-head");
    as(HEAD);
    await saveDraft("cr-test-head", [note(9)]);
    expect((await submit("cr-test-head")).status).toBe(403);
  });

  it("locks the draft while in review, except for reviewers, whose saves update the request", async () => {
    const n = await openRequest("cr-test");
    const before = await detail(n);

    as(STAFF_B);
    const locked = await saveDraft("cr-test", [note(1)]);
    expect(locked.status).toBe(409);
    expect((await locked.json()).code).toBe("draft_locked");
    as(STAFF_A);
    expect((await saveDraft("cr-test", [note(1)])).status).toBe(409);

    as(HEAD);
    const fixed = [...LIVE_NOTES, note(3, { title: "Chapter 3 (fixed)" })];
    expect((await saveDraft("cr-test", fixed)).status).toBe(200);
    const after = await detail(n);
    expect(after.proposedHash).not.toBe(before.proposedHash);
    const edit = after.events.find((e: { type: string }) => e.type === "reviewer_edited");
    expect(edit.actor.name).toBe("Maeve");
    expect(edit.changes[0]).toMatchObject({ type: "modified", label: "Chapter 3 (fixed)" });
  });

  it("only lets publishers publish directly, never while a request is open", async () => {
    as(STAFF_A);
    await saveDraft("cr-test", [...LIVE_NOTES, note(3)]);
    expect((await publish("cr-test")).status).toBe(403);

    as(HEAD);
    const res = await publish("cr-test");
    expect(res.status).toBe(200);
    expect((await subjectDoc("cr-test"))!.notes).toHaveLength(3);
    const logged = await models.Event.findOne({ slug: "cr-test", type: "published_directly" }).lean<{
      requestId: unknown;
      actor: { name: string };
    }>();
    expect(logged!.requestId).toBeNull();
    expect(logged!.actor.name).toBe("Maeve");

    await openRequest("cr-test", [note(1)]);
    as(HEAD);
    expect((await publish("cr-test")).status).toBe(409);
  });

  it("runs the request-changes → revise → resubmit → approve loop", async () => {
    const n = await openRequest("cr-test");

    as(HEAD);
    expect((await act(n, "request-changes", {})).status).toBe(400);
    expect((await act(n, "request-changes", { note: "Use the 2027 link" })).status).toBe(200);

    as(STAFF_B);
    expect((await saveDraft("cr-test", [note(1)])).status).toBe(409);
    expect((await act(n, "resubmit")).status).toBe(403);

    as(STAFF_A);
    const revised = [...LIVE_NOTES, note(3, { link: "https://example.com/2027" })];
    expect((await saveDraft("cr-test", revised)).status).toBe(200);
    expect((await detail(n)).draftDiffers).toBe(true);
    expect((await act(n, "resubmit", { note: "Updated" })).status).toBe(200);

    const resubmitted = await detail(n);
    expect(resubmitted.status).toBe("in_review");
    expect(resubmitted.round).toBe(2);
    expect(resubmitted.sinceLastReview).toEqual([
      expect.objectContaining({ type: "modified", label: "Chapter 3" }),
    ]);

    as(STAFF_A);
    expect((await act(n, "approve", { expectedHash: resubmitted.proposedHash })).status).toBe(403);

    as(HEAD);
    const stale = await act(n, "approve", { expectedHash: "0".repeat(64) });
    expect(stale.status).toBe(409);
    expect((await stale.json()).code).toBe("stale");

    const ok = await act(n, "approve", { expectedHash: resubmitted.proposedHash, note: "Thanks!" });
    expect(ok.status).toBe(200);
    expect(revalidateDataTags).toHaveBeenCalledWith("resources", "resource:cr-test");

    const doc = await subjectDoc("cr-test");
    expect(doc!.notes.map((x) => x.title)).toEqual(["Chapter 1", "Chapter 2", "Chapter 3"]);
    expect(doc!.hasUnpublishedChanges).toBe(false);

    const closed = await detail(n);
    expect(closed).toMatchObject({ status: "approved", open: false, closeNote: "Thanks!" });
    expect(closed.events.map((e: { type: string }) => e.type)).toEqual([
      "submitted",
      "changes_requested",
      "resubmitted",
      "approved",
    ]);

    const revision = await models.Revision.findOne({ slug: "cr-test", action: "publish", kind: "edit" }).lean<{
      message: string;
      requestId: unknown;
    }>();
    expect(revision!.message).toBe(`Approved #${n}: Add chapter 3`);
    expect(String(revision!.requestId)).toBe(String((await models.Request.findOne({ number: n }))!._id));
  });

  it("publishes once when two reviewers approve at the same time", async () => {
    const n = await openRequest("cr-test");
    const { proposedHash } = await detail(n);
    as(HEAD);
    const [one, two] = await Promise.all([
      act(n, "approve", { expectedHash: proposedHash }),
      act(n, "approve", { expectedHash: proposedHash }),
    ]);
    expect([one.status, two.status].sort()).toEqual([200, 409]);
    expect(
      await models.Revision.countDocuments({ slug: "cr-test", action: "publish", kind: "edit" }),
    ).toBe(1);
  });

  it("releases the approval lease when publishing fails", async () => {
    const n = await openRequest("cr-test");
    const { proposedHash } = await detail(n);
    // Simulate a draft that drifted from the proposal outside the API.
    await models.resources2Data.collection.updateOne(
      { slug: "cr-test" },
      { $set: { "draft.notes": [note(7)] } },
    );
    as(HEAD);
    const res = await act(n, "approve", { expectedHash: proposedHash });
    expect(res.status).toBe(409);
    const req = await models.Request.findOne({ number: n }).lean<{ approvingAt: Date | null; status: string }>();
    expect(req!.approvingAt).toBeNull();
    expect(req!.status).toBe("in_review");
  });

  it("rejecting resets the draft, keeps the author's latest edits, and can be restored", async () => {
    const n = await openRequest("cr-test");
    as(HEAD);
    await act(n, "request-changes", { note: "Not quite" });
    as(STAFF_A);
    const latest = [...LIVE_NOTES, note(3), note(4)];
    await saveDraft("cr-test", latest);

    as(HEAD);
    expect((await act(n, "reject", {})).status).toBe(400);
    expect((await act(n, "reject", { note: "Out of scope" })).status).toBe(200);
    const doc = await subjectDoc("cr-test");
    expect(doc!.draft.notes.map((x) => x.title)).toEqual(["Chapter 1", "Chapter 2"]);
    expect(doc!.hasUnpublishedChanges).toBe(false);
    expect((await detail(n)).hasDiscardedDraft).toBe(true);

    // Another request blocks restoring the rejected one.
    const other = await openRequest("cr-test", [note(1)]);
    as(STAFF_A);
    expect((await act(n, "restore")).status).toBe(403);
    as(STAFF_A);
    await act(other, "withdraw");

    as(STAFF_B);
    expect((await act(n, "restore")).status).toBe(403);
    as(STAFF_A);
    expect((await act(n, "restore")).status).toBe(200);
    expect((await subjectDoc("cr-test"))!.draft.notes).toHaveLength(4);
  });

  it("only lets the author withdraw, and keeps the draft", async () => {
    const n = await openRequest("cr-test");
    as(STAFF_B);
    expect((await act(n, "withdraw")).status).toBe(403);
    as(HEAD);
    expect((await act(n, "withdraw")).status).toBe(403);
    as(STAFF_A);
    expect((await act(n, "withdraw")).status).toBe(200);
    expect((await subjectDoc("cr-test"))!.draft.notes).toHaveLength(3);
    as(STAFF_B);
    expect((await saveDraft("cr-test", [note(1)])).status).toBe(200);
  });

  it("lets anyone on the team comment, and lists requests by tab", async () => {
    const n = await openRequest("cr-test");
    as(STAFF_B);
    expect((await act(n, "comments", { body: "" })).status).toBe(400);
    expect((await act(n, "comments", { body: "Looks good to me" })).status).toBe(200);
    const comment = (await detail(n)).events.find((e: { type: string }) => e.type === "comment");
    expect(comment).toMatchObject({ body: "Looks good to me", actor: { name: "Ben" } });

    const list = async (query: string) =>
      (await (await requestsApi.GET(json("GET", `/requests?${query}`))).json()).data.map(
        (r: { number: number }) => r.number,
      );
    expect(await list("tab=needs-review")).toEqual([n]);
    expect(await list("tab=closed")).toEqual([]);
    as(STAFF_A);
    expect(await list("tab=open&mine=1")).toEqual([n]);
    as(STAFF_B);
    expect(await list("tab=open&mine=1")).toEqual([]);
  });

  it("lets admins approve their own request but not department heads", async () => {
    await seedSubject("cr-test-own");
    // A head who submitted while they were still staff.
    as({ ...HEAD, roles: ["resource_staff"] });
    await saveDraft("cr-test-own", [note(5)]);
    const res = await submit("cr-test-own");
    const n = (await res.json()).number;
    const { proposedHash } = await detail(n);

    as(HEAD);
    expect((await act(n, "approve", { expectedHash: proposedHash })).status).toBe(403);
    as({ ...ADMIN, id: HEAD.id });
    expect((await act(n, "approve", { expectedHash: proposedHash })).status).toBe(200);
  });

  it("blocks restoring an old revision into a locked draft", async () => {
    const n = await openRequest("cr-test");
    const revision = await models.Revision.findOne({ slug: "cr-test" }).lean<{ _id: unknown }>();
    as(STAFF_B);
    const res = await restoreRevisionApi.POST(
      json("POST", "/cr-test/restore", { revisionId: String(revision!._id) }),
      { params: Promise.resolve({ slug: "cr-test" }) },
    );
    expect(res.status).toBe(409);
    expect(n).toBeGreaterThan(0);
  });
});
