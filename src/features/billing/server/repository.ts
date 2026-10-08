import 'server-only'
import { randomUUID } from 'node:crypto'
import { postgresQuery, withPostgresTransaction } from '@/server/db/postgres'
import { getPlan, planCatalog } from '../plans'
import type { PlanId, Subscription, SubscriptionStatus } from '../types'

const map = (row: Record<string, unknown>) => row as unknown as Subscription

async function ensurePlans() {
  for (const plan of Object.values(planCatalog)) {
    await postgresQuery(`INSERT INTO platform_plans (id, name, description, features, price, currency, max_sites, media_storage_bytes, max_media_per_site, allowed_blocks, custom_domain)
      VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, $10::jsonb, $11)
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, features = EXCLUDED.features,
        price = EXCLUDED.price, max_sites = EXCLUDED.max_sites, media_storage_bytes = EXCLUDED.media_storage_bytes,
        max_media_per_site = EXCLUDED.max_media_per_site, allowed_blocks = EXCLUDED.allowed_blocks, custom_domain = EXCLUDED.custom_domain`,
      [plan.id, plan.name, plan.description, JSON.stringify(plan.features), plan.price, plan.currency, plan.maxSites, plan.mediaStorageBytes, plan.maxMediaPerSite, JSON.stringify(plan.allowedBlocks), plan.customDomain])
  }
}

export async function seedPlatformPlans() {
  await withPostgresTransaction(async client => {
    for (const plan of Object.values(planCatalog)) {
      await client.query(`INSERT INTO platform_plans (id, name, description, features, price, currency, max_sites, media_storage_bytes, max_media_per_site, allowed_blocks, custom_domain)
        VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, $10::jsonb, $11)
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, features = EXCLUDED.features,
          price = EXCLUDED.price, currency = EXCLUDED.currency, max_sites = EXCLUDED.max_sites, media_storage_bytes = EXCLUDED.media_storage_bytes,
          max_media_per_site = EXCLUDED.max_media_per_site, allowed_blocks = EXCLUDED.allowed_blocks, custom_domain = EXCLUDED.custom_domain`,
        [plan.id, plan.name, plan.description, JSON.stringify(plan.features), plan.price, plan.currency, plan.maxSites, plan.mediaStorageBytes,
          plan.maxMediaPerSite, JSON.stringify(plan.allowedBlocks), plan.customDomain])
    }
  })
}

export async function findSubscription(userId: string) {
  await ensurePlans()
  const result = await postgresQuery('SELECT * FROM platform_subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId])
  return result.rows[0] ? map(result.rows[0]) : null
}

export async function createTrial(userId: string, now = new Date()) {
  const existing = await findSubscription(userId)
  if (existing) return existing
  const starts = now.toISOString()
  const ends = new Date(now.getTime() + 30 * 86400000).toISOString()
  await postgresQuery(`INSERT INTO platform_subscriptions
    (id, user_id, plan_id, status, starts_at, current_period_ends_at, grace_period_ends_at, provider, currency, contracted_price, cancel_at_period_end, created_at, updated_at)
    VALUES ($1, $2, 'free', 'trialing', $3, $4, NULL, 'manual', 'ARS', $5, FALSE, $3, $3)`, [randomUUID(), userId, starts, ends, getPlan('free').price])
  return findSubscription(userId)
}

export async function updateSubscriptionStatus(id: string, status: SubscriptionStatus, periodEndsAt: string, graceEndsAt: string | null = null) {
  await postgresQuery('UPDATE platform_subscriptions SET status = $1, current_period_ends_at = $2, grace_period_ends_at = $3, updated_at = $4 WHERE id = $5',
    [status, periodEndsAt, graceEndsAt, new Date().toISOString(), id])
}

export async function activatePlan(userId: string, planId: PlanId, provider: 'manual' | 'mercadopago' = 'manual', externalSubscriptionId: string | null = null, periodDays = 30) {
  const plan = getPlan(planId)
  await ensurePlans()
  const now = new Date()
  const starts = now.toISOString()
  const ends = new Date(now.getTime() + periodDays * 86400000).toISOString()
  const existing = await findSubscription(userId)
  if (existing) {
    await postgresQuery(`UPDATE platform_subscriptions SET plan_id = $1, status = 'active', starts_at = $2, current_period_ends_at = $3,
      grace_period_ends_at = NULL, provider = $4, currency = 'ARS', contracted_price = $5, external_subscription_id = $6, updated_at = $2 WHERE id = $7`,
      [planId, starts, ends, provider, plan.price, externalSubscriptionId, existing.id])
  } else {
    await postgresQuery(`INSERT INTO platform_subscriptions
      (id, user_id, plan_id, status, starts_at, current_period_ends_at, grace_period_ends_at, provider, currency, contracted_price, external_subscription_id, cancel_at_period_end, created_at, updated_at)
      VALUES ($1, $2, $3, 'active', $4, $5, NULL, $6, 'ARS', $7, $8, FALSE, $4, $4)`,
      [randomUUID(), userId, planId, starts, ends, provider, plan.price, externalSubscriptionId])
  }
  return findSubscription(userId)
}

export async function recordBillingEvent(provider: string, eventId: string, payload: string) {
  const result = await postgresQuery('INSERT INTO platform_billing_events (id, provider, payload, created_at) VALUES ($1, $2, $3::jsonb, $4) ON CONFLICT (id) DO NOTHING',
    [eventId, provider, payload, new Date().toISOString()])
  return (result.rowCount || 0) > 0
}

export async function ensureFreeSubscription(userId: string) {
  await createTrial(userId)
}

export async function listAdminSubscriptions() {
  await ensurePlans()
  const result = await postgresQuery(`SELECT subscriptions.id AS subscription_id, users.id AS user_id, users.name AS user_name, users.email,
    subscriptions.status, subscriptions.provider, subscriptions.current_period_ends_at, subscriptions.updated_at,
    plans.id, plans.name, plans.price, plans.currency, plans.max_sites, plans.custom_domain
    FROM platform_subscriptions subscriptions JOIN platform_users users ON users.id = subscriptions.user_id JOIN platform_plans plans ON plans.id = subscriptions.plan_id ORDER BY users.name COLLATE "C"`)
  return result.rows as {
    subscription_id: string; user_id: string; user_name: string; email: string; status: string; provider: string;
    current_period_ends_at: string | null; updated_at: string; id: PlanId; name: string; price: number; currency: string; max_sites: number; custom_domain: boolean
  }[]
}

export async function updateSubscription(subscriptionId: string, planId: PlanId, status: SubscriptionStatus) {
  await ensurePlans()
  const now = new Date().toISOString()
  if (status === 'active') {
    const ends = new Date(Date.now() + 30 * 86400000).toISOString()
    await postgresQuery('UPDATE platform_subscriptions SET plan_id = $1, status = $2, starts_at = $3, current_period_ends_at = $4, grace_period_ends_at = NULL, updated_at = $3 WHERE id = $5', [planId, status, now, ends, subscriptionId])
    return
  }
  await postgresQuery('UPDATE platform_subscriptions SET plan_id = $1, status = $2, updated_at = $3 WHERE id = $4', [planId, status, now, subscriptionId])
}
