import 'server-only'
import { randomUUID } from 'node:crypto'
import { db } from '@/server/db/sqlite'
import { getPlan } from '../plans'
import type { PlanId, Subscription, SubscriptionStatus } from '../types'

const map = (row: Record<string, unknown>) => row as unknown as Subscription

export function findSubscription(userId: string) {
  const row = db().prepare('SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(userId) as Record<string, unknown> | undefined
  return row ? map(row) : null
}

export function createTrial(userId: string, now = new Date()) {
  if (findSubscription(userId)) return findSubscription(userId)
  const starts = now.toISOString()
  const ends = new Date(now.getTime() + 30 * 86400000).toISOString()
  const id = randomUUID()
  const plan = getPlan('free')
  db().prepare(`INSERT INTO subscriptions
    (id, user_id, plan_id, status, starts_at, current_period_ends_at, grace_period_ends_at, provider, currency, contracted_price, cancel_at_period_end, created_at, updated_at)
    VALUES (?, ?, 'free', 'trialing', ?, ?, NULL, 'manual', 'ARS', ?, 0, ?, ?)`).run(id, userId, starts, ends, plan.price, starts, starts)
  return findSubscription(userId)
}

export function updateSubscriptionStatus(id: string, status: SubscriptionStatus, periodEndsAt: string, graceEndsAt: string | null = null) {
  db().prepare('UPDATE subscriptions SET status = ?, current_period_ends_at = ?, grace_period_ends_at = ?, updated_at = ? WHERE id = ?')
    .run(status, periodEndsAt, graceEndsAt, new Date().toISOString(), id)
}

export function activatePlan(userId: string, planId: PlanId, provider: 'manual' | 'mercadopago' = 'manual', externalSubscriptionId: string | null = null, periodDays = 30) {
  const plan = getPlan(planId)
  const now = new Date()
  const starts = now.toISOString()
  const ends = new Date(now.getTime() + periodDays * 86400000).toISOString()
  const existing = findSubscription(userId)
  if (existing) {
    db().prepare(`UPDATE subscriptions SET plan_id = ?, status = 'active', starts_at = ?, current_period_ends_at = ?, grace_period_ends_at = NULL,
      provider = ?, currency = 'ARS', contracted_price = ?, external_subscription_id = ?, updated_at = ? WHERE id = ?`)
      .run(planId, starts, ends, provider, plan.price, externalSubscriptionId, starts, existing.id)
    return findSubscription(userId)
  }
  const id = randomUUID()
  db().prepare(`INSERT INTO subscriptions
    (id, user_id, plan_id, status, starts_at, current_period_ends_at, grace_period_ends_at, provider, currency, contracted_price, external_subscription_id, cancel_at_period_end, created_at, updated_at)
    VALUES (?, ?, ?, 'active', ?, ?, NULL, ?, 'ARS', ?, ?, 0, ?, ?)`).run(id, userId, planId, starts, ends, provider, plan.price, externalSubscriptionId, starts, starts)
  return findSubscription(userId)
}

export function recordBillingEvent(provider: string, eventId: string, payload: string) {
  const result = db().prepare('INSERT OR IGNORE INTO billing_events (id, provider, payload, created_at) VALUES (?, ?, ?, ?)')
    .run(eventId, provider, payload, new Date().toISOString())
  return result.changes > 0
}

export function ensureFreeSubscription(userId: string) {
  createTrial(userId)
}

export function listAdminSubscriptions() {
  return db().prepare(`SELECT subscriptions.id AS subscription_id, users.id AS user_id, users.name AS user_name, users.email,
    subscriptions.status, subscriptions.provider, subscriptions.current_period_ends_at, subscriptions.updated_at,
    plans.id, plans.name, plans.price, plans.currency, plans.max_sites, plans.custom_domain
    FROM subscriptions JOIN users ON users.id = subscriptions.user_id JOIN plans ON plans.id = subscriptions.plan_id ORDER BY users.name COLLATE NOCASE`).all() as {
    subscription_id: string; user_id: string; user_name: string; email: string; status: string; provider: string;
    current_period_ends_at: string | null; updated_at: string; id: PlanId; name: string; price: number; currency: string; max_sites: number; custom_domain: number
  }[]
}

export function updateSubscription(subscriptionId: string, planId: PlanId, status: SubscriptionStatus) {
  const now = new Date().toISOString()
  db().prepare('UPDATE subscriptions SET plan_id = ?, status = ?, updated_at = ? WHERE id = ?').run(planId, status, now, subscriptionId)
}
