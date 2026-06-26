/**
 * Client-side rate limiting utilities
 *
 * SECURITY NOTE: These are CLIENT-SIDE throttles only. An attacker can bypass
 * by clearing localStorage or editing the code. Real rate limiting + DDoS
 * protection requires server-side implementation (e.g. Redis + IP tracking).
 *
 * These are useful as UX guards to prevent accidental spam and provide
 * feedback to legitimate users.
 */

type RateLimitConfig = {
  key: string;
  maxAttempts: number;
  windowMs: number;
};

/**
 * Check if an action is rate-limited
 * Returns { allowed: boolean, remainingMs?: number }
 */
export function checkRateLimit(config: RateLimitConfig): {
  allowed: boolean;
  remainingMs?: number;
} {
  const { key, maxAttempts, windowMs } = config;
  const storageKey = `rateLimit_${key}`;

  const now = Date.now();
  const stored = localStorage.getItem(storageKey);

  if (!stored) {
    // First attempt
    localStorage.setItem(
      storageKey,
      JSON.stringify({ count: 1, firstAttempt: now })
    );
    return { allowed: true };
  }

  const data = JSON.parse(stored);
  const elapsed = now - data.firstAttempt;

  if (elapsed > windowMs) {
    // Window expired, reset
    localStorage.setItem(
      storageKey,
      JSON.stringify({ count: 1, firstAttempt: now })
    );
    return { allowed: true };
  }

  if (data.count >= maxAttempts) {
    // Rate limit exceeded
    const remainingMs = windowMs - elapsed;
    return { allowed: false, remainingMs };
  }

  // Increment count
  localStorage.setItem(
    storageKey,
    JSON.stringify({ count: data.count + 1, firstAttempt: data.firstAttempt })
  );
  return { allowed: true };
}

/**
 * Format remaining time for user display
 */
export function formatRemainingTime(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes}m`;
}