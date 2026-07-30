import {
  getCachedResourceBySlug,
  getCachedResourceMetadata,
  getCachedResourceSlugs,
} from "@/lib/data/resources";

export async function getResourceForStaticParams() {
  return getCachedResourceSlugs();
}

export async function getResourceForGenerateMetadata(slug: string) {
  return getCachedResourceMetadata(slug);
}

export async function getResource(slug: string) {
  return getCachedResourceBySlug(slug);
}
