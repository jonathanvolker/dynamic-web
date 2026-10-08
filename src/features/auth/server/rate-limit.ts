import 'server-only'
import { createHash } from 'node:crypto'
import { postgresQuery } from '@/server/db/postgres'
import { isLoginAllowed, nextLoginRateLimit } from './rate-limit-policy'
export { LOGIN_BASE_BACKOFF_MS, LOGIN_MAX_FAILURES, LOGIN_WINDOW_MS } from './rate-limit-policy'

import type { LoginRateLimitState } from './rate-limit-policy'

const emailKey = (email: string) => createHash('sha256').update(email).digest('hex')

type PostgresRateLimitRow = { window_start: Date; failures: number; locked_until: Date }

const toState = (row: PostgresRateLimitRow | undefined): LoginRateLimitState | undefined => row && ({
  window_start: row.window_start.getTime(),
  failures: row.failures,
  locked_until: row.locked_until.getTime(),
})

export async function loginAllowed(email: string, now = Date.now()) {
  const key = emailKey(email)
  const result = await postgresQuery<PostgresRateLimitRow>(
    'SELECT window_start, failures, locked_until FROM platform_auth_login_rate_limits WHERE email_hash = $1',
    [key],
  )
  return isLoginAllowed(toState(result.rows[0]), now)
}

export async function recordLoginFailure(email: string, now = Date.now()) {
  const key = emailKey(email)
  const result = await postgresQuery<PostgresRateLimitRow>(
    'SELECT window_start, failures, locked_until FROM platform_auth_login_rate_limits WHERE email_hash = $1',
    [key],
  )
  const next = nextLoginRateLimit(toState(result.rows[0]), now)
  await postgresQuery(`
    INSERT INTO platform_auth_login_rate_limits (email_hash, window_start, failures, locked_until)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT(email_hash) DO UPDATE SET window_start = EXCLUDED.window_start,
      failures = EXCLUDED.failures, locked_until = EXCLUDED.locked_until
  `, [key, new Date(next.window_start), next.failures, new Date(next.locked_until)])
}

export async function clearLoginFailures(email: string) {
  await postgresQuery('DELETE FROM platform_auth_login_rate_limits WHERE email_hash = $1', [emailKey(email)])
}
