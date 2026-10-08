import { createHash } from 'node:crypto'
import { isIP } from 'node:net'
import { db } from './db/sqlite'

export type RateLimitStore = {
  consume(bucket: string, limit: number, windowMs: number, now?: number): boolean
}

const localBuckets = new Map<string, { windowStart: number; count: number }>()
const MAX_LOCAL_BUCKETS = 10_000

function bucketHash(bucket: string) {
  return createHash('sha256').update(bucket).digest('hex')
}

const localStore: RateLimitStore = {
  consume(bucket, limit, windowMs, now = Date.now()) {
    const current = localBuckets.get(bucket)
    if (!current || now - current.windowStart >= windowMs) {
      if (localBuckets.size >= MAX_LOCAL_BUCKETS) {
        for (const [key, value] of localBuckets) {
          if (now - value.windowStart >= windowMs) localBuckets.delete(key)
          if (localBuckets.size < MAX_LOCAL_BUCKETS) break
        }
      }
      if (localBuckets.size >= MAX_LOCAL_BUCKETS) return false
      localBuckets.set(bucket, { windowStart: now, count: 1 })
      return true
    }
    if (current.count >= limit) return false
    current.count += 1
    return true
  },
}

const sharedStore: RateLimitStore = {
  consume(bucket, limit, windowMs, now = Date.now()) {
    if (!bucket || !Number.isSafeInteger(limit) || limit < 1 || !Number.isSafeInteger(windowMs) || windowMs < 1) return false
    const result = db().prepare(`
      INSERT INTO distributed_rate_limits (bucket_hash, window_start, count) VALUES (?, ?, 1)
      ON CONFLICT(bucket_hash) DO UPDATE SET
        window_start = CASE WHEN ? - window_start >= ? THEN excluded.window_start ELSE window_start END,
        count = CASE WHEN ? - window_start >= ? THEN 1 ELSE count + 1 END
      WHERE ? - window_start >= ? OR count < ?
    `).run(bucketHash(bucket), now, now, windowMs, now, windowMs, now, windowMs, limit)
    return result.changes > 0
  },
}

export const rateLimitStore: RateLimitStore = {
  consume(bucket, limit, windowMs, now) {
    try {
      return sharedStore.consume(bucket, limit, windowMs, now)
    } catch {
      // A failed shared store must still leave a conservative local guard in place.
      return localStore.consume(bucket, limit, windowMs, now)
    }
  },
}

export function consumeRateLimit(bucket: string, limit: number, windowMs: number, now?: number) {
  return rateLimitStore.consume(bucket, limit, windowMs, now)
}

export function clientAddress(headers: Headers) {
  if (process.env.TRUST_PROXY_HEADERS !== 'true') return 'unknown'
  const candidates = [headers.get('x-forma-client-ip'), headers.get('x-real-ip'), headers.get('x-forwarded-for')?.split(',')[0]?.trim()]
  return candidates.find(value => value && isIP(value) > 0) || 'unknown'
}

export function clearLocalRateLimits() {
  localBuckets.clear()
}
