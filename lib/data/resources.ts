import { buildKey, getOrSet } from "@/lib/cache";
import connectDB from "@/lib/mongodb";
import ResourcesData from "@/models/resourcesData";
import resources2Data from "@/models/resources2Data";

type ResourceMeta = {
  subject: string;
};

export async function getCachedResourceSlugs() {
  return getOrSet(
    buildKey("resources", "slugs"),
    async () => {
      await connectDB();
      return resources2Data.find({}, { slug: 1, _id: 0 }).lean();
    },
    { ttlSec: 3600, tags: ["resources"] }
  );
}

export async function getCachedResourceMetadata(slug: string) {
  return getOrSet(
    buildKey("resources", "meta", slug),
    async () => {
      await connectDB();
      return resources2Data
        .findOne({ slug }, { subject: 1, _id: 0 })
        .lean<ResourceMeta>();
    },
    { ttlSec: 3600, tags: ["resources", `resource:${slug}`] }
  );
}

export async function getCachedResourceBySlug(slug: string) {
  return getOrSet(
    buildKey("resources", "slug", slug),
    async () => {
      await connectDB();
      const resource = await resources2Data.findOne({ slug }).lean();
      return JSON.parse(JSON.stringify(resource));
    },
    { ttlSec: 3600, tags: ["resources", `resource:${slug}`] }
  );
}

export async function getCachedResource2ById(id: string) {
  return getOrSet(
    buildKey("resources2", "id", id),
    async () => {
      await connectDB();
      const doc = await resources2Data.findById(id).lean();
      return doc ? JSON.parse(JSON.stringify(doc)) : null;
    },
    { ttlSec: 3600, tags: ["resources"] }
  );
}

export async function getCachedLegacyResourceList() {
  return getOrSet(
    buildKey("resources", "legacy", "list"),
    async () => {
      await connectDB();
      return ResourcesData.find().lean();
    },
    { ttlSec: 1800, tags: ["resources-legacy"] }
  );
}

export async function getCachedLegacyResourceById(id: string) {
  return getOrSet(
    buildKey("resources", "legacy", "id", id),
    async () => {
      await connectDB();
      return ResourcesData.findOne({ _id: id }).lean();
    },
    { ttlSec: 1800, tags: ["resources-legacy"] }
  );
}
