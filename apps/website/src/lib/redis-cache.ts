import { ensureRedisConnected } from "@/lib/redis";

const KEY_PREFIX = "cache:";
const TAG_PREFIX = "tag:";

type RedisCachedOptions = {
  ttlSec: number;
  tags?: string[];
};

function cacheKey(key: string): string {
  return `${KEY_PREFIX}${key}`;
}

function tagKey(tag: string): string {
  return `${TAG_PREFIX}${tag}`;
}

export async function redisCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  { ttlSec, tags = [] }: RedisCachedOptions
): Promise<T> {
  const redis = await ensureRedisConnected();
  const fullKey = cacheKey(key);

  if (redis) {
    try {
      const cached = await redis.get(fullKey);
      if (cached !== null) {
        return JSON.parse(cached) as T;
      }
    } catch (err) {
      console.warn("[redis-cache] GET error, falling back to fetcher:", err);
    }
  }

  const value = await fetcher();

  if (redis) {
    try {
      const serialized = JSON.stringify(value);
      await redis.setex(fullKey, ttlSec, serialized);

      if (tags.length > 0) {
        const pipeline = redis.pipeline();
        for (const tag of tags) {
          pipeline.sadd(tagKey(tag), fullKey);
        }
        await pipeline.exec();
      }
    } catch (err) {
      console.warn("[redis-cache] SET error:", err);
    }
  }

  return value;
}

export async function invalidateRedisTags(...tags: string[]): Promise<void> {
  const redis = await ensureRedisConnected();
  if (!redis || tags.length === 0) return;

  try {
    const keysToDelete = new Set<string>();

    for (const tag of tags) {
      const members = await redis.smembers(tagKey(tag));
      for (const member of members) {
        keysToDelete.add(member);
      }
      keysToDelete.add(tagKey(tag));
    }

    if (keysToDelete.size > 0) {
      await redis.del(...keysToDelete);
    }
  } catch (err) {
    console.warn("[redis-cache] invalidate error:", err);
  }
}

export async function invalidateUserCache(email: string): Promise<void> {
  await invalidateRedisTags(`user:${email}`);
}
