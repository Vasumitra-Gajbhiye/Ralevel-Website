import { beforeEach, describe, expect, it, vi } from "vitest";

const { findOne, findById } = vi.hoisted(() => ({
  findOne: vi.fn(),
  findById: vi.fn(),
}));

vi.mock("@/lib/mongodb", () => ({ default: vi.fn(async () => undefined) }));
vi.mock("@/lib/data-cache", () => ({
  cachedQuery: (_key: string[], fn: () => Promise<unknown>) => fn(),
}));
vi.mock("@/models/resources2Data", () => ({ default: { findOne, findById } }));
vi.mock("@/models/resourcesData", () => ({ default: {} }));

import { getCachedResource2ById, getCachedResourceBySlug } from "../resources";

const leanResult = (doc: unknown) => ({ lean: () => Promise.resolve(doc) });

describe("public resource reads", () => {
  beforeEach(() => {
    findOne.mockReset().mockReturnValue(leanResult({ slug: "accounting" }));
    findById.mockReset().mockReturnValue(leanResult({ slug: "accounting" }));
  });

  it("leaves the CMS draft out of the subject page data", async () => {
    await getCachedResourceBySlug("accounting");
    expect(findOne).toHaveBeenCalledWith(
      { slug: "accounting" },
      expect.objectContaining({ draft: 0 }),
    );
  });

  it("leaves the CMS draft out of the public JSON API", async () => {
    await getCachedResource2ById("abc123");
    expect(findById).toHaveBeenCalledWith(
      "abc123",
      expect.objectContaining({ draft: 0 }),
    );
  });
});
