import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { findOne, getAuthSession } = vi.hoisted(() => ({
  findOne: vi.fn(),
  getAuthSession: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/mongodb", () => ({ default: vi.fn(async () => undefined) }));
vi.mock("@/models/adminPageAccess", () => ({ default: { findOne } }));
vi.mock("@/lib/getAuthSession", () => ({ getAuthSession }));

import { DEFAULT_ACCESS_MAP } from "../resolve";
import {
  canAccessSection,
  canEnterAdminPanel,
  getAdminAccessState,
  invalidateAdminAccessCache,
  requireSectionAction,
} from "../server";

const storedDoc = (doc: unknown) => findOne.mockReturnValue({ lean: () => Promise.resolve(doc) });
const failingRead = () =>
  findOne.mockReturnValue({ lean: () => Promise.reject(new Error("db down")) });

describe("admin access server state", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-27T10:00:00Z"));
    invalidateAdminAccessCache();
    findOne.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("uses the defaults when there's no document", async () => {
    storedDoc(null);
    const state = await getAdminAccessState();
    expect(state.map).toEqual(DEFAULT_ACCESS_MAP);
    expect(state.version).toBe(0);
    expect(state.overrides).toEqual({});
  });

  it("applies stored overrides", async () => {
    storedDoc({ sections: { scheduling: ["owner", "admin", "senior_mod"] }, version: 3 });
    expect(await canAccessSection(["senior_mod"], "scheduling")).toBe(true);
    expect(await canEnterAdminPanel(["senior_mod"])).toBe(true);
    expect((await getAdminAccessState()).version).toBe(3);
  });

  it("reads the database at most once per TTL, and again after invalidating", async () => {
    storedDoc(null);
    await getAdminAccessState();
    await getAdminAccessState();
    expect(findOne).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(11_000);
    await getAdminAccessState();
    expect(findOne).toHaveBeenCalledTimes(2);

    invalidateAdminAccessCache();
    await getAdminAccessState();
    expect(findOne).toHaveBeenCalledTimes(3);
  });

  it("keeps serving the last good copy when a read fails", async () => {
    storedDoc({ sections: { legal: ["owner", "admin", "helper"] }, version: 1 });
    await getAdminAccessState();

    vi.advanceTimersByTime(11_000);
    failingRead();
    expect(await canAccessSection(["helper"], "legal")).toBe(true);
  });

  it("fails closed to owners and admins when nothing was ever read", async () => {
    failingRead();
    const { map } = await getAdminAccessState();
    expect(map.scheduling).toEqual(["owner", "admin"]);
    expect(map.forms).toEqual(["owner", "admin"]);
    // Locked pages keep their defaults.
    expect(map.blogs).toEqual(DEFAULT_ACCESS_MAP.blogs);
  });

  it("guards server actions", async () => {
    storedDoc(null);
    getAuthSession.mockResolvedValue({ userData: { roles: ["writer"] } });
    await expect(requireSectionAction("certificates")).rejects.toThrow("FORBIDDEN");

    getAuthSession.mockResolvedValue({ userData: { roles: ["admin"] } });
    await expect(requireSectionAction("certificates")).resolves.toBeTruthy();

    getAuthSession.mockResolvedValue(null);
    await expect(requireSectionAction("certificates")).rejects.toThrow("FORBIDDEN");
  });
});
