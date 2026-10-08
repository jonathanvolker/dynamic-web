import 'server-only'
import { createHash } from 'node:crypto'
import { db } from '@/server/db/sqlite'
import { isLoginAllowed, nextLoginRateLimit } from './rate-limit-policy'
export { LOGIN_BASE_BACKOFF_MS, LOGIN_MAX_FAILURES, LOGIN_WINDOW_MS } from './rate-limit-policy'

import type { LoginRateLimitState } from './rate-limit-policy'

const emailKey = (email: string) => createHash('sha256').update(email).digest('hex')

export function loginAllowed(email: string, now = Date.now()) {
  const key = emailKey(email)
  const row = db().prepare('SELECT window_start, failures, locked_until FROM auth_login_rate_limits WHERE email_hash = ?').get(key) as LoginRateLimitState | undefined
  return isLoginAllowed(row, now)
}

export function recordLoginFailure(email: string, now = Date.now()) {
  const database = db()
  const key = emailKey(email)
  const row = database.prepare('SELECT window_start, failures, locked_until FROM auth_login_rate_limits WHERE email_hash = ?').get(key) as LoginRateLimitState | undefined
  const next = nextLoginRateLimit(row, now)
  database.prepare(`
    INSERT INTO auth_login_rate_limits (email_hash, window_start, failures, locked_until) VALUES (?, ?, ?, ?)
    ON CONFLICT(email_hash) DO UPDATE SET window_start = excluded.window_start,
      failures = excluded.failures, locked_until = excluded.locked_until
  `).run(key, next.window_start, next.failures, next.locked_until)
}

export function clearLoginFailures(email: string) {
  db().prepare('DELETE FROM auth_login_rate_limits WHERE email_hash = ?').run(emailKey(email))
}
