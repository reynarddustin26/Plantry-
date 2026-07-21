// In-memory, fixed-window rate limiter — 20 requests/user/hour (blueprint's
// Phase 7 requirement). Deliberately dependency-free: this app runs as a
// single Next.js server process, not a multi-instance/serverless fleet, so
// a shared store (Redis, Supabase) would be solving a problem this
// deployment doesn't have yet. Revisit if that changes.
const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  key: string,
  now: number = Date.now(),
  maxRequests: number = MAX_REQUESTS_PER_WINDOW,
): RateLimitResult {
  const entry = store.get(key);

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + WINDOW_MS };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.windowStart + WINDOW_MS };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.windowStart + WINDOW_MS,
  };
}

/** Test-only: clears all rate-limit state between test cases. */
export function _resetRateLimitStoreForTests(): void {
  store.clear();
}
