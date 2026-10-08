export const LOGIN_WINDOW_MS = 15 * 60 * 1000
export const LOGIN_MAX_FAILURES = 5
export const LOGIN_BASE_BACKOFF_MS = 60 * 1000

export type LoginRateLimitState = { window_start: number; failures: number; locked_until: number }

export function isLoginAllowed(row: LoginRateLimitState | undefined, now: number) {
  return !row || now - row.window_start >= LOGIN_WINDOW_MS || row.locked_until <= now
}

export function nextLoginRateLimit(row: LoginRateLimitState | undefined, now: number) {
  const freshWindow = !row || now - row.window_start >= LOGIN_WINDOW_MS
  const windowStart = freshWindow ? now : row.window_start
  const failures = freshWindow ? 1 : row.failures + 1
  const backoff = failures >= LOGIN_MAX_FAILURES
    ? Math.min(LOGIN_BASE_BACKOFF_MS * 2 ** (failures - LOGIN_MAX_FAILURES), LOGIN_WINDOW_MS)
    : 0
  return { window_start: windowStart, failures, locked_until: backoff ? now + backoff : 0 }
}
