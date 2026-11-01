import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Role } from "@/lib/roles";

const { getAuthSession, uploadImageToCloudinary } = vi.hoisted(() => ({
  getAuthSession: vi.fn(),
  uploadImageToCloudinary: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/mongodb", () => ({ default: vi.fn(async () => undefined) }));
// No saved page access, so every section uses its registry defaults.
vi.mock("@/models/adminPageAccess", () => ({
  default: { findOne: () => ({ lean: () => Promise.resolve(null) }) },
}));
vi.mock("@/lib/getAuthSession", () => ({ getAuthSession }));
vi.mock("@/lib/rateLimit", () => ({ enforceRateLimit: vi.fn(async () => null) }));
vi.mock("@/lib/csrf", () => ({ enforceSameOrigin: () => null }));
vi.mock("@/lib/cloudinaryUpload", () => ({ uploadImageToCloudinary }));
vi.mock("@/lib/data/resources-homepage", () => ({
  getResourcesHomepage: vi.fn(async () => ({ featured: [], popularSlugs: [] })),
  getCachedResourceSubjects: vi.fn(async () => []),
  RESOURCES_HOMEPAGE_TAG: "resources-homepage",
}));

import { invalidateAdminAccessCache } from "@/lib/admin-access/server";
import { GET as getHomepage } from "@/app/api/admin/resource-cms/homepage/route";
import { POST as uploadThumbnail } from "@/app/api/admin/resource-cms/upload-thumbnail/route";
import { canPublishResources } from "../access";

const signInAs = (roles: Role[]) =>
  getAuthSession.mockResolvedValue({
    userId: "clerk_1",
    user: { email: "someone@example.com", name: "Someone", image: null },
    userData: { id: "user_1", roles, isOwner: false },
  });

function uploadRequest(section: string) {
  const form = new FormData();
  form.set("file", new File([new Uint8Array([1, 2, 3])], "a.png", { type: "image/png" }));
  form.set("section", section);
  form.set("slug", "accounting");
  return new Request("http://localhost/api/admin/resource-cms/upload-thumbnail", {
    method: "POST",
    body: form,
  });
}

describe("resource publishing access", () => {
  beforeEach(() => {
    invalidateAdminAccessCache();
    getAuthSession.mockReset();
    uploadImageToCloudinary.mockReset().mockResolvedValue({ path: "/books_thumb/x.png" });
  });

  it("is on for heads and admins and off for staff by default", async () => {
    expect(await canPublishResources(["resource_dep_head"])).toBe(true);
    expect(await canPublishResources(["admin"])).toBe(true);
    expect(await canPublishResources(["resource_staff"])).toBe(false);
    expect(await canPublishResources(undefined)).toBe(false);
  });

  it("keeps the resources homepage API from staff", async () => {
    signInAs(["resource_staff"]);
    const staff = await getHomepage(new Request("http://localhost/api/admin/resource-cms/homepage"));
    expect(staff.status).toBe(403);

    signInAs(["resource_dep_head"]);
    const head = await getHomepage(new Request("http://localhost/api/admin/resource-cms/homepage"));
    expect(head.status).toBe(200);
  });

  it("lets staff upload subject thumbnails but not featured-card images", async () => {
    signInAs(["resource_staff"]);
    expect((await uploadThumbnail(uploadRequest("books"))).status).toBe(200);
    expect((await uploadThumbnail(uploadRequest("featured"))).status).toBe(403);
    expect(uploadImageToCloudinary).toHaveBeenCalledTimes(1);

    signInAs(["resource_dep_head"]);
    expect((await uploadThumbnail(uploadRequest("featured"))).status).toBe(200);
  });
});
