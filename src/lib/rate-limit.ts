// src/lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Define an interface so we can seamlessly switch between Redis and Fallback implementations
interface IRateLimiter {
  check(ip: string): Promise<boolean>;
}

class UpstashRateLimiter implements IRateLimiter {
  private limiter: Ratelimit;

  constructor(requests: number, windowStr: string) {
    this.limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(requests, windowStr as any),
      analytics: true,
    });
  }

  async check(ip: string): Promise<boolean> {
    try {
      const { success } = await this.limiter.limit(ip);
      return success;
    } catch (e) {
      console.error("Rate limit error (Redis might be down/unreachable):", e);
      // Fail open to avoid blocking legitimate users if Redis goes down temporarily
      return true;
    }
  }
}

// Fallback in-memory rate limiter for development when Redis is not configured
class FallbackInMemoryRateLimiter implements IRateLimiter {
  private ipMap: Map<string, { count: number; lastReset: number }>;
  private limit: number;
  private windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.ipMap = new Map();
    this.limit = limit;
    this.windowMs = windowMs;
  }

  async check(ip: string): Promise<boolean> {
    const now = Date.now();
    const record = this.ipMap.get(ip);

    if (!record) {
      this.ipMap.set(ip, { count: 1, lastReset: now });
      return true;
    }

    if (now - record.lastReset > this.windowMs) {
      this.ipMap.set(ip, { count: 1, lastReset: now });
      return true;
    }

    if (record.count >= this.limit) {
      return false;
    }

    record.count += 1;
    return true;
  }
}

// Factory to create the correct rate limiter based on env vars
function createRateLimiter(
  requests: number,
  windowStr: string,
  fallbackWindowMs: number
): IRateLimiter {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return new UpstashRateLimiter(requests, windowStr);
  } else {
    if (process.env.NODE_ENV === "production") {
      console.warn("⚠️ Using in-memory fallback rate limiter in production. This is ineffective in serverless environments.");
    }
    return new FallbackInMemoryRateLimiter(requests, fallbackWindowMs);
  }
}

export const loginRateLimiter = createRateLimiter(5, "60 s", 60000); // 5 tentatives par minute
export const signupRateLimiter = createRateLimiter(3, "3600 s", 3600000); // 3 tentatives par heure
