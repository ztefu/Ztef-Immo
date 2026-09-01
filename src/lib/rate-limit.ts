// src/lib/rate-limit.ts
export class RateLimiter {
  private ipMap: Map<string, { count: number; lastReset: number }>;
  private limit: number;
  private windowMs: number;

  constructor(limit: number = 5, windowMs: number = 60000) {
    this.ipMap = new Map();
    this.limit = limit;
    this.windowMs = windowMs;
  }

  public check(ip: string): boolean {
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

export const loginRateLimiter = new RateLimiter(5, 60000); // 5 tentatives par minute
export const signupRateLimiter = new RateLimiter(3, 3600000); // 3 tentatives par heure
