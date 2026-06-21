import { getRedis } from "@/lib/redis";

const PREFIX = "rlevel:";

export type CacheOptions = {
  ttlSec: number;
  tags?: string[];
};

export function buildKey(namespace: string, ...parts: string[]): string {
  return `${PREFIX}${namespace}:${parts.join(":")}`;
}

function tagKey(tag: string): string {
  return `${PREFIX}tag:${tag}`;
}

let cacheFallbackLogged = false;

function logCacheFallback(err: unknown) {
  if (!cacheFallbackLogged) {
    console.warn("[cache] Redis unavailable, falling back to source:", err);
    cacheFallbackLogged = true;
  }
}

export async function getOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  { ttlSec, tags = [] }: CacheOptions
): Promise<T> {
  const redis = getRedis();
  if (!redis) {
    return fetcher();
  }

  try {
    const cached = await redis.get(key);
    if (cached !== null) {
      return JSON.parse(cached) as T;
    }
  } catch (err) {
    logCacheFallback(err);
    return fetcher();
  }

  const value = await fetcher();

  try {
    const pipeline = redis.pipeline();
    pipeline.set(key, JSON.stringify(value), "EX", ttlSec);
    for (const tag of tags) {
      pipeline.sadd(tagKey(tag), key);
      pipeline.expire(tagKey(tag), ttlSec + 3600);
    }
    await pipeline.exec();
  } catch (err) {
    logCacheFallback(err);
  }

  return value;
}

export async function invalidateKey(key: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.del(key);
  } catch (err) {
    console.warn("[cache] failed to invalidate key:", key, err);
  }
}

export async function invalidateTags(...tags: string[]): Promise<void> {
  const redis = getRedis();
  if (!redis || tags.length === 0) return;

  try {
    for (const tag of tags) {
      const keys = await redis.smembers(tagKey(tag));
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      await redis.del(tagKey(tag));
    }
  } catch (err) {
    console.warn("[cache] failed to invalidate tags:", tags, err);
  }
}

export const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
};
