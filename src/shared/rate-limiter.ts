/**
 * Reusable per-IP rate limiter factory.
 * Creates an in-memory rate limiter with automatic cleanup of expired entries.
 */
export function createRateLimiter(options: { windowMs: number; maxRequests: number; cleanupIntervalMs?: number }) {
  const map = new Map<string, { count: number; resetAt: number }>();

  // Cleanup timer
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of map.entries()) {
      if (now > value.resetAt) map.delete(key);
    }
  }, options.cleanupIntervalMs || 5 * 60 * 1000).unref();

  return function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = map.get(ip);
    if (!entry || now > entry.resetAt) {
      map.set(ip, { count: 1, resetAt: now + options.windowMs });
      return true;
    }
    entry.count++;
    return entry.count <= options.maxRequests;
  };
}
