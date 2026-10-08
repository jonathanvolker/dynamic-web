import 'server-only'
import { getPlan } from '../plans'
import { createTrial, findSubscription, updateSubscriptionStatus } from './repository'
import type { Entitlements } from '../types'
import { db } from '@/server/db/sqlite'

export function ensureSubscription(userId: string) {
  return findSubscription(userId) || createTrial(userId)
}

export function getEntitlements(userId: string, now = new Date()): Entitlements {
  const subscription = ensureSubscription(userId)!
  const plan = getPlan(subscription.plan_id)
  const periodEnd = new Date(subscription.current_period_ends_at)
  let status = subscription.status
  let graceEnd = subscription.grace_period_ends_at ? new Date(subscription.grace_period_ends_at) : null

  if (status === 'trialing' && periodEnd <= now) {
    updateSubscriptionStatus(subscription.id, 'expired', subscription.current_period_ends_at)
    status = 'expired'
  } else if (status === 'active' && periodEnd <= now) {
    graceEnd = new Date(now.getTime() + 30 * 86400000)
    updateSubscriptionStatus(subscription.id, 'past_due', subscription.current_period_ends_at, graceEnd.toISOString())
    status = 'past_due'
  } else if (status === 'past_due' && graceEnd && graceEnd <= now) {
    updateSubscriptionStatus(subscription.id, 'expired', subscription.current_period_ends_at, graceEnd.toISOString())
    status = 'expired'
  }

  const hardLocked = status === 'expired' || status === 'canceled'
  if (hardLocked) db().prepare('UPDATE sites SET published = NULL, published_at = NULL WHERE owner_id = ?').run(userId)
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

export function assertCanCreateSite(userId: string) {
  const entitlements = getEntitlements(userId)
  if (!entitlements.canCreateSite) throw new Error('Tu suscripción venció. Activá un plan para crear sitios.')
  return entitlements
}

export function assertCanEdit(userId: string) {
  const entitlements = getEntitlements(userId)
  if (!entitlements.canEdit) throw new Error('Tu suscripción venció. Activá un plan para editar.')
  return entitlements
}

export function assertCanPublish(userId: string) {
  const entitlements = getEntitlements(userId)
  if (!entitlements.canPublish) throw new Error(entitlements.subscription.status === 'past_due'
    ? `Tu pago está pendiente. Podés publicar nuevamente cuando se regularice la suscripción.`
    : 'Tu suscripción venció. Activá un plan para publicar.')
  return entitlements
}

export function assertCanUseCustomDomain(userId: string) {
  const entitlements = getEntitlements(userId)
  if (!entitlements.plan.customDomain || !entitlements.canEdit) {
    throw new Error('El dominio personalizado requiere una suscripción Profesional vigente.')
  }
  return entitlements
}
