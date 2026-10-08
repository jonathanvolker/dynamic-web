import assert from 'node:assert/strict'
import { test } from 'node:test'

const { LOGIN_BASE_BACKOFF_MS, LOGIN_MAX_FAILURES, LOGIN_WINDOW_MS, isLoginAllowed, nextLoginRateLimit } = await import('../src/features/auth/server/rate-limit-policy')

test('login rate limit allows five failures and applies exponential backoff', () => {
  const start = 1_000_000
  let state
  for (let failures = 1; failures <= LOGIN_MAX_FAILURES; failures++) {
    assert.equal(isLoginAllowed(state, start), true)
    state = nextLoginRateLimit(state, start)
  }
  assert.equal(isLoginAllowed(state, start), false)
  assert.equal(isLoginAllowed(state, start + LOGIN_BASE_BACKOFF_MS), true)

  state = nextLoginRateLimit(state, start + LOGIN_BASE_BACKOFF_MS)
  assert.equal(isLoginAllowed(state, start + LOGIN_BASE_BACKOFF_MS), false)
  assert.equal(isLoginAllowed(state, start + LOGIN_BASE_BACKOFF_MS + LOGIN_BASE_BACKOFF_MS * 2 + 1), true)
})

test('rate limit resets after the window', () => {
  const start = 2_000_000
  let state
  for (let failures = 0; failures < LOGIN_MAX_FAILURES; failures++) state = nextLoginRateLimit(state, start)
  assert.equal(isLoginAllowed(state, start), false)
  assert.equal(isLoginAllowed(state, start + LOGIN_WINDOW_MS), true)
  assert.equal(nextLoginRateLimit(state, start + LOGIN_WINDOW_MS).failures, 1)
})
