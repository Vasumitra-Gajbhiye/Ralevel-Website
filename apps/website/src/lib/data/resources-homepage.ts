import { cachedQuery } from "@/lib/data-cache";
import connectDB from "@/lib/mongodb";
import resources2Data from "@/models/resources2Data";
import ResourcesHomepage from "@/models/resourcesHomepage";
import type {
  FeaturedCard,
  ResourcesHomepageConfig,
  ResourceSubjectSummary,
} from "@/types/resources2";

export const RESOURCES_HOMEPAGE_TAG = "resources-homepage";

type SubjectDoc = {
  subject?: string;
  slug?: string;
  theme?: {
    primary?: string;
    primaryLight?: string;
    primaryTextStrong?: string;
    borderLighter?: string;
  };
};

type HomepageDoc = {
  featured?: FeaturedCard[];
  popularSlugs?: string[];
};

export async function getCachedResourceSubjects(): Promise<
  ResourceSubjectSummary[]
> {
  return cachedQuery(
    ["resources", "subjects"],
    async () => {
      await connectDB();
      const docs = await resources2Data
        .find(
          {},
          {
            _id: 0,
            subject: 1,
            slug: 1,
            "theme.primary": 1,
            "theme.primaryLight": 1,
            "theme.primaryTextStrong": 1,
            "theme.borderLighter": 1,
          },
        )
        .sort({ subject: 1 })
        .lean<SubjectDoc[]>();

      return docs
        .filter((doc) => doc.subject && doc.slug)
        .map((doc) => ({
          subject: doc.subject!,
          slug: doc.slug!,
          primary: doc.theme?.primary,
          primaryLight: doc.theme?.primaryLight,
          primaryTextStrong: doc.theme?.primaryTextStrong,
          borderLighter: doc.theme?.borderLighter,
        }));
    },
    { revalidate: 3600, tags: ["resources"] },
  );
}

export async function getResourcesHomepage(): Promise<ResourcesHomepageConfig> {
  await connectDB();
  const doc = await ResourcesHomepage.findOne({ key: "default" })
    .select("featured popularSlugs")
    .lean<HomepageDoc>();

  return {
    featured: (doc?.featured ?? []).map((card) => ({
      title: card.title,
      href: card.href,
      ...(card.description && { description: card.description }),
      ...(card.image && { image: card.image }),
      ...(card.badge && { badge: card.badge }),
    })),
    popularSlugs: doc?.popularSlugs ?? [],
  };
}

export async function getCachedResourcesHomepage() {
  return cachedQuery(["resources", "homepage"], getResourcesHomepage, {
    revalidate: 3600,
    tags: [RESOURCES_HOMEPAGE_TAG],
  });
}
