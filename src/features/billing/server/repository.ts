import 'server-only'
import { randomUUID } from 'node:crypto'
import { db } from '@/server/db/sqlite'

export type Plan = { id: string; name: string; priceCents: number; currency: string; interval: string; siteLimit: number; storageLimitMb: number; customDomain: boolean }
export type AdminSubscription = Plan & { subscriptionId: string; userId: string; userName: string; email: string; status: string; provider: string; currentPeriodEnd: string | null; updatedAt: string }

export function ensureFreeSubscription(userId: string) {
  const now = new Date().toISOString()
  db().prepare(`INSERT OR IGNORE INTO subscriptions (id, user_id, plan_id, status, provider, created_at, updated_at)
    VALUES (?, ?, 'free', 'active', 'manual', ?, ?)`).run(randomUUID(), userId, now, now)
}

export function listPlans() {
  return (db().prepare('SELECT * FROM plans ORDER BY price_cents').all() as Record<string, unknown>[]).map(plan => ({
    id: plan.id as string, name: plan.name as string, priceCents: plan.price_cents as number, currency: plan.currency as string,
    interval: plan.interval as string, siteLimit: plan.site_limit as number, storageLimitMb: plan.storage_limit_mb as number, customDomain: Boolean(plan.custom_domain),
  }))
}

export function listAdminSubscriptions() {
  return (db().prepare(`SELECT subscriptions.id AS subscription_id, users.id AS user_id, users.name AS user_name, users.email,
    subscriptions.status, subscriptions.provider, subscriptions.current_period_end, subscriptions.updated_at,
    plans.id, plans.name, plans.price_cents, plans.currency, plans.interval, plans.site_limit, plans.storage_limit_mb, plans.custom_domain
    FROM subscriptions JOIN users ON users.id = subscriptions.user_id JOIN plans ON plans.id = subscriptions.plan_id ORDER BY users.name`).all() as Record<string, unknown>[]).map(row => ({
    subscriptionId: row.subscription_id as string, userId: row.user_id as string, userName: row.user_name as string, email: row.email as string,
    status: row.status as string, provider: row.provider as string, currentPeriodEnd: row.current_period_end as string | null, updatedAt: row.updated_at as string,
    id: row.id as string, name: row.name as string, priceCents: row.price_cents as number, currency: row.currency as string, interval: row.interval as string,
    siteLimit: row.site_limit as number, storageLimitMb: row.storage_limit_mb as number, customDomain: Boolean(row.custom_domain),
  }))
}

export function updateSubscription(subscriptionId: string, planId: string, status: string) {
  if (!['active', 'trialing', 'past_due', 'canceled', 'unpaid'].includes(status)) throw new Error('Estado de suscripción no válido.')
  db().prepare('UPDATE subscriptions SET plan_id = ?, status = ?, updated_at = ? WHERE id = ?').run(planId, status, new Date().toISOString(), subscriptionId)
}
