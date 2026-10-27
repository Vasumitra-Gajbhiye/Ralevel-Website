// Runs the Page access API against the local test Mongo (docker, port 27028).
// Opt-in: RUN_DB_TESTS=1 pnpm exec vitest run src/lib/admin-access
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const TEST_MONGODB_URI = "mongodb://127.0.0.1:27028/ralevel_test";
const enabled = process.env.RUN_DB_TESTS === "1";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/rateLimit", () => ({ enforceRateLimit: async () => null }));
vi.mock("@/lib/csrf", () => ({ enforceSameOrigin: () => null }));
vi.mock("@/lib/getAuthSession", () => ({
  getAuthSession: async () => ({
    userId: "user_test_admin",
    user: { email: "test-admin@example.com", name: "Test Admin", image: null },
    userData: { id: "000000000000000000000001", roles: ["admin"], isOwner: false },
  }),
}));

type Api = typeof import("@/app/api/admin/permissions/route");
type HistoryApi = typeof import("@/app/api/admin/permissions/history/route");

describe.skipIf(!enabled)("Page access API (test database)", () => {
  let api: Api;
  let historyApi: HistoryApi;
  let clearCollections: () => Promise<void>;
  let canAccessSection: typeof import("../server").canAccessSection;

  const put = (body: unknown) =>
    api.PUT(
      new Request("http://localhost/api/admin/permissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    );

  beforeAll(async () => {
    process.env.MONGODB_URI = TEST_MONGODB_URI;
    api = await import("@/app/api/admin/permissions/route");
    historyApi = await import("@/app/api/admin/permissions/history/route");
    ({ canAccessSection } = await import("../server"));
    const { default: connectDB } = await import("@/lib/mongodb");
    const { default: AdminPageAccess } = await import("@/models/adminPageAccess");
    const { default: AdminPageAccessChange } = await import("@/models/adminPageAccessChange");
    const conn = await connectDB();
    expect(conn.connection.host).toBe("127.0.0.1");
    expect(conn.connection.port).toBe(27028);
    clearCollections = async () => {
      await AdminPageAccess.deleteMany({});
      await AdminPageAccessChange.deleteMany({});
    };
    await clearCollections();
  });

  afterAll(async () => {
    if (!enabled) return;
    await clearCollections();
    const mongoose = (await import("mongoose")).default;
    await mongoose.disconnect();
  });

  it("starts from defaults", async () => {
    const res = await api.GET(new Request("http://localhost/api/admin/permissions"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.version).toBe(0);
    expect(body.overrides).toEqual({});
  });

  it("saves a grant, records history and applies it right away", async () => {
    const res = await put({
      baseVersion: 0,
      changes: [{ section: "scheduling", role: "senior_mod", granted: true }],
      note: "Mods help with events",
    });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.version).toBe(1);
    expect(body.data.overrides.scheduling).toContain("senior_mod");
    expect(body.data.updatedBy).toEqual({ name: "Test Admin", email: "test-admin@example.com" });
    expect(body.data.lastChange.byRole.senior_mod.by.name).toBe("Test Admin");
    expect(await canAccessSection(["senior_mod"], "scheduling")).toBe(true);
  });

  it("rejects a save based on an old version", async () => {
    const res = await put({
      baseVersion: 0,
      changes: [{ section: "legal", role: "helper", granted: true }],
    });
    const body = await res.json();
    expect(res.status).toBe(409);
    expect(body.latest.version).toBe(1);
    expect(await canAccessSection(["helper"], "legal")).toBe(false);
  });

  it("refuses owner and locked pages", async () => {
    const owner = await put({
      baseVersion: 1,
      changes: [{ section: "team", role: "owner", granted: false }],
    });
    const locked = await put({
      baseVersion: 1,
      changes: [{ section: "permissions", role: "helper", granted: true }],
    });
    const unknown = await put({
      baseVersion: 1,
      changes: [{ section: "made-up", role: "helper", granted: true }],
    });
    expect([owner.status, locked.status, unknown.status]).toEqual([400, 400, 400]);
  });

  it("lets only one of two simultaneous saves through", async () => {
    const [a, b] = await Promise.all([
      put({ baseVersion: 1, changes: [{ section: "legal", role: "helper", granted: true }] }),
      put({ baseVersion: 1, changes: [{ section: "apply", role: "helper", granted: true }] }),
    ]);
    expect([a.status, b.status].sort()).toEqual([200, 409]);
  });

  it("stores nothing once everything is back to default", async () => {
    const state = await (await api.GET(new Request("http://localhost/x"))).json();
    const revert = Object.entries(state.overrides as Record<string, string[]>).flatMap(
      ([section, roles]) =>
        roles
          .filter((role) => ["senior_mod", "helper"].includes(role))
          .map((role) => ({ section, role, granted: false })),
    );
    const res = await put({ baseVersion: state.version, changes: revert });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.overrides).toEqual({});
  });

  it("lists history newest first, filtered and paginated", async () => {
    const all = await (
      await historyApi.GET(new Request("http://localhost/x?limit=2"))
    ).json();
    expect(all.entries).toHaveLength(2);
    expect(all.nextCursor).toBeTruthy();
    expect(new Date(all.entries[0].at) >= new Date(all.entries[1].at)).toBe(true);

    const next = await (
      await historyApi.GET(new Request(`http://localhost/x?limit=2&before=${all.nextCursor}`))
    ).json();
    expect(next.entries.length).toBeGreaterThan(0);

    const forScheduling = await (
      await historyApi.GET(new Request("http://localhost/x?section=scheduling"))
    ).json();
    expect(
      forScheduling.entries.every((e: { changes: { section: string }[] }) =>
        e.changes.some((c) => c.section === "scheduling"),
      ),
    ).toBe(true);
    expect(forScheduling.entries[forScheduling.entries.length - 1].note).toBe(
      "Mods help with events",
    );

    const bad = await historyApi.GET(new Request("http://localhost/x?role=nope"));
    expect(bad.status).toBe(400);
  });
});
