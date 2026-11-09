import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis =
  redisUrl && redisToken
    ? new Redis({
        url: redisUrl,
        token: redisToken,
      })
    : null;

// In-memory cache fallback for local development or when Upstash is not configured
interface MemoryCacheItem {
  value: any;
  expiresAt: number;
}

const memoryStore: Map<string, MemoryCacheItem> =
  (globalThis as any).__skyswift_memory_cache || new Map();
(globalThis as any).__skyswift_memory_cache = memoryStore;

/**
 * Helper to cache data with a TTL (in seconds)
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  // 1. If Redis client exists, try Redis
  if (redis) {
    try {
      const res = await redis.get<T>(key);
      if (res !== null && res !== undefined) return res;
    } catch (error) {
      console.warn("Redis get failed, falling back to memory:", error);
    }
  }

  // 2. In-memory fallback
  const item = memoryStore.get(key);
  if (item) {
    if (Date.now() > item.expiresAt) {
      memoryStore.delete(key);
      return null;
    }
    return item.value as T;
  }

  return null;
}

export async function cacheSet(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
  // Always set in memory store for fast local resolution
  memoryStore.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });

  // If Redis is configured, also set in Upstash Redis
  if (redis) {
    try {
      await redis.set(key, value, { ex: ttlSeconds });
    } catch (error) {
      console.warn("Redis set failed:", error);
    }
  }
}
