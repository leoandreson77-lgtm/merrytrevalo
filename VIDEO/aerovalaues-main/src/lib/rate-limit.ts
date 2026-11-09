import { cacheGet, cacheSet } from "./redis";

export interface RateLimitOptions {
  limit: number;      // Maximum requests allowed in the window
  windowSeconds: number; // Window duration in seconds
}

/**
 * Validates request rate quotas for a given key (IP/Token) using Redis.
 * If Redis is not configured, this falls back to true (allows the request).
 */
export async function checkRateLimit(
  key: string,
  action: string,
  options: RateLimitOptions
): Promise<{ success: boolean; count: number; limit: number }> {
  try {
    const cacheKey = `ratelimit:${action}:${key}`;
    const current = await cacheGet<number>(cacheKey);

    if (current === null) {
      // First request in the window, set key with TTL
      await cacheSet(cacheKey, 1, options.windowSeconds);
      return { success: true, count: 1, limit: options.limit };
    }

    if (current >= options.limit) {
      // Limit exceeded
      return { success: false, count: current, limit: options.limit };
    }

    // Increment count (Upstash redis set with current value + 1, keeping approximate TTL)
    await cacheSet(cacheKey, current + 1, options.windowSeconds);
    return { success: true, count: current + 1, limit: options.limit };
  } catch (error) {
    console.error("Rate limiter failure:", error);
    // Graceful fallback to avoid locking out genuine users in case of Redis connection drops
    return { success: true, count: 1, limit: options.limit };
  }
}
