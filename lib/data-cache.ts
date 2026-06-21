import { revalidateTag, unstable_cache } from "next/cache";

export function cachedQuery<T>(
  key: string[],
  fn: () => Promise<T>,
  { revalidate, tags }: { revalidate: number; tags: string[] }
): Promise<T> {
  return unstable_cache(fn, key, { revalidate, tags })();
}

export function revalidateDataTags(...tags: string[]) {
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }
}
