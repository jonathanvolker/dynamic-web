import 'server-only'
import { getPlan } from '../plans'
import { createTrial, findSubscription, updateSubscriptionStatus } from './repository'
import type { Entitlements } from '../types'
import { postgresQuery } from '@/server/db/postgres'

export async function ensureSubscription(userId: string) {
  return await findSubscription(userId) || await createTrial(userId)
}

export async function getEntitlements(userId: string, now = new Date()): Promise<Entitlements> {
  const subscription = (await ensureSubscription(userId))!
  const plan = getPlan(subscription.plan_id)
  const periodEnd = new Date(subscription.current_period_ends_at)
  let status = subscription.status
  let graceEnd = subscription.grace_period_ends_at ? new Date(subscription.grace_period_ends_at) : null

  if (status === 'trialing' && periodEnd <= now) {
    await updateSubscriptionStatus(subscription.id, 'expired', subscription.current_period_ends_at)
    status = 'expired'
  } else if (status === 'active' && periodEnd <= now) {
    graceEnd = new Date(now.getTime() + 30 * 86400000)
    await updateSubscriptionStatus(subscription.id, 'past_due', subscription.current_period_ends_at, graceEnd.toISOString())
    status = 'past_due'
  } else if (status === 'past_due' && graceEnd && graceEnd <= now) {
    await updateSubscriptionStatus(subscription.id, 'expired', subscription.current_period_ends_at, graceEnd.toISOString())
    status = 'expired'
  }

  const hardLocked = status === 'expired' || status === 'canceled'
  if (hardLocked) await postgresQuery('UPDATE platform_sites SET published = NULL, published_at = NULL WHERE owner_id = $1', [userId])
  const graceDaysRemaining = graceEnd ? Math.max(0, Math.ceil((graceEnd.getTime() - now.getTime()) / 86400000)) : 0
  return {
    plan, subscription: { ...subscription, status, grace_period_ends_at: graceEnd?.toISOString() || subscription.grace_period_ends_at },
    canEdit: !hardLocked, canPublish: !hardLocked && status !== 'past_due', canCreateSite: !hardLocked,
    availableBlocks: new Set(plan.allowedBlocks === 'all' ? [] : plan.allowedBlocks), graceDaysRemaining,
  }
}

export function canUseBlock(entitlements: Entitlements, blockType: string) {
  return entitlements.plan.allowedBlocks === 'all' || entitlements.plan.allowedBlocks.includes(blockType)
}

export async function assertCanCreateSite(userId: string) {
  const entitlements = await getEntitlements(userId)
  if (!entitlements.canCreateSite) throw new Error('Tu suscripción venció. Activá un plan para crear sitios.')
  return entitlements
}

export async function assertCanEdit(userId: string) {
  const entitlements = await getEntitlements(userId)
  if (!entitlements.canEdit) throw new Error('Tu suscripción venció. Activá un plan para editar.')
  return entitlements
}

export async function assertCanPublish(userId: string) {
  const entitlements = await getEntitlements(userId)
  if (!entitlements.canPublish) throw new Error(entitlements.subscription.status === 'past_due'
    ? 'Tu pago está pendiente. Podés publicar nuevamente cuando se regularice la suscripción.'
    : 'Tu suscripción venció. Activá un plan para publicar.')
  return entitlements
}

export async function assertCanUseCustomDomain(userId: string) {
  const entitlements = await getEntitlements(userId)
  if (!entitlements.plan.customDomain || !entitlements.canEdit) {
    throw new Error('El dominio personalizado requiere una suscripción Profesional vigente.')
  }
  return entitlements
}
