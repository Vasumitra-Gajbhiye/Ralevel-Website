import { cachedQuery } from "@/lib/data-cache";
import connectDB from "@/lib/mongodb";
import ResourcesData from "@/models/resourcesData";
import resources2Data from "@/models/resources2Data";

type ResourceMeta = {
  subject: string;
};

export async function getCachedResourceSlugs() {
  return cachedQuery(
    ["resources", "slugs"],
    async () => {
      await connectDB();
      return resources2Data.find({}, { slug: 1, _id: 0 }).lean();
    },
    { revalidate: 3600, tags: ["resources"] }
  );
}

export async function getCachedResourceMetadata(slug: string) {
  return cachedQuery(
    ["resources", "meta", slug],
    async () => {
      await connectDB();
      return resources2Data
        .findOne({ slug }, { subject: 1, _id: 0 })
        .lean<ResourceMeta>();
    },
    { revalidate: 3600, tags: ["resources", `resource:${slug}`] }
  );
}

export async function getCachedResourceBySlug(slug: string) {
  return cachedQuery(
    ["resources", "slug", slug],
    async () => {
      await connectDB();
      const resource = await resources2Data.findOne({ slug }).lean();
      return resource;
    },
    { revalidate: 3600, tags: ["resources", `resource:${slug}`] }
  );
}

export async function getCachedResource2ById(id: string) {
  return cachedQuery(
    ["resources2", "id", id],
    async () => {
      await connectDB();
      const doc = await resources2Data.findById(id).lean();
      return doc ?? null;
    },
    { revalidate: 3600, tags: ["resources"] }
  );
}

type LegacyResourceListOptions = {
  page?: number;
  limit?: number;
};

export async function getCachedLegacyResourceList(
  options: LegacyResourceListOptions = {}
) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 50;
  const skip = (page - 1) * limit;

  return cachedQuery(
    ["resources", "legacy", "list", String(page), String(limit)],
    async () => {
      await connectDB();
      const [data, total] = await Promise.all([
        ResourcesData.find().sort({ _id: -1 }).skip(skip).limit(limit).lean(),
        ResourcesData.countDocuments(),
      ]);
      return { data, total, page, limit };
    },
    { revalidate: 1800, tags: ["resources-legacy"] }
  );
}

export async function getCachedLegacyResourceById(id: string) {
  return cachedQuery(
    ["resources", "legacy", "id", id],
    async () => {
      await connectDB();
      return ResourcesData.findOne({ _id: id }).lean();
    },
    { revalidate: 1800, tags: ["resources-legacy"] }
  );
}
