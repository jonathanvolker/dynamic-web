'use server'

import { redirect } from 'next/navigation'
import { currentUser } from '@/features/auth/server/session'
import { createMercadoPagoCheckout } from './providers/mercadopago'
import type { PlanId } from './types'
import { requireAdmin } from '@/features/auth/server/session'
import { updateSubscription } from './server/repository'
import type { SubscriptionStatus } from './types'
import { getEntitlements } from './server/access'

export async function startCheckout(planId: PlanId, _formData?: FormData): Promise<void> {
  const user = await currentUser()
  if (!user) redirect('/login')
  if (planId === 'free') redirect('/dashboard')
  const entitlements = getEntitlements(user.id)
  const currentPlan = entitlements.plan.id
  const activePaid = ['active', 'trialing', 'past_due'].includes(entitlements.subscription.status) && currentPlan !== 'free'
  if (activePaid && planId === currentPlan) redirect(`/planes?error=${encodeURIComponent('Ya tenés este plan activo.')}`)
  if (activePaid && currentPlan === 'professional' && planId === 'initial') redirect(`/planes?error=${encodeURIComponent('No podés bajar de Profesional a Inicial mientras tu suscripción esté activa.')}`)
  let url: string
  try {
    url = await createMercadoPagoCheckout({ userId: user.id, email: user.email, planId, returnUrl: `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/planes` })
  } catch (error) {
    redirect(`/planes?error=${encodeURIComponent(error instanceof Error ? error.message : 'No pudimos iniciar el checkout.')}`)
  }
  redirect(url)
}

export async function changeSubscription(form: FormData): Promise<void> {
  await requireAdmin()
  const subscriptionId = String(form.get('subscriptionId') || '')
  const planId = String(form.get('planId') || '') as PlanId
  const status = String(form.get('status') || '') as SubscriptionStatus
  if (!['free', 'initial', 'professional'].includes(planId) || !['trialing', 'active', 'past_due', 'canceled', 'expired'].includes(status)) redirect('/admin/platform?error=Datos+de+suscripción+inválidos.')
  updateSubscription(subscriptionId, planId, status)
  redirect('/admin/platform?success=Suscripción+actualizada.')
}
