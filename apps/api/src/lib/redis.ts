/**
 * Upstash Redis client for rate limiting.
 * Falls back to an in-memory stub when UPSTASH_REDIS_REST_URL is not set
 * so the app boots cleanly in development without Redis.
 */

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // unix timestamp ms
}

class MemoryRateLimiter {
  private store = new Map<string, { count: number; resetAt: number }>();

  async check(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
    }

    entry.count += 1;
    const remaining = Math.max(0, limit - entry.count);
    return { allowed: entry.count <= limit, remaining, resetAt: entry.resetAt };
  }
}

class UpstashRateLimiter {
  constructor(private url: string, private token: string) {}

  async check(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const windowSec = Math.floor(windowMs / 1000);
    const resetAt = Date.now() + windowMs;

    try {
      // Use INCR + EXPIRE pipeline via Upstash REST API
      const res = await fetch(`${this.url}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", key],
          ["EXPIRE", key, windowSec, "NX"],
        ]),
      });

      if (!res.ok) {
        // On Redis error, allow the request (fail open)
        return { allowed: true, remaining: limit, resetAt };
      }

      const data = (await res.json()) as [[null, number], [null, number]];
      const count = data[0][1];
      const remaining = Math.max(0, limit - count);
      return { allowed: count <= limit, remaining, resetAt };
    } catch {
      // Fail open
      return { allowed: true, remaining: limit, resetAt };
    }
  }
}

const limiter: { check: (key: string, limit: number, windowMs: number) => Promise<RateLimitResult> } =
  REDIS_URL && REDIS_TOKEN
    ? new UpstashRateLimiter(REDIS_URL, REDIS_TOKEN)
    : new MemoryRateLimiter();

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  return limiter.check(key, limit, windowMs);
}
