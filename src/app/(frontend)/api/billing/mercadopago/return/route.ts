import { NextResponse } from 'next/server'
import { activatePlan } from '@/features/billing/server/repository'
import { fetchMercadoPagoSubscription } from '@/features/billing/providers/mercadopago'
import { currentUser } from '@/features/auth/server/session'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const externalId = url.searchParams.get('preapproval_id') || url.searchParams.get('id')
  const destination = new URL('/planes', url.origin)

  if (!externalId) {
    destination.searchParams.set('error', 'Mercado Pago no devolvió el identificador de la suscripción.')
    return NextResponse.redirect(destination)
  }

  try {
    const subscription = await fetchMercadoPagoSubscription(externalId)
    const [userId, planId] = String(subscription.external_reference || '').split(':')
    if (!userId || !['initial', 'professional'].includes(planId)) {
      destination.searchParams.set('error', 'La suscripción no está asociada a una cuenta válida.')
      return NextResponse.redirect(destination)
    }
    const user = await currentUser()
    if (!user || user.id !== userId) {
      destination.searchParams.set('error', 'La suscripción no corresponde a la cuenta actual.')
      return NextResponse.redirect(destination)
    }
    if (subscription.status === 'authorized') {
      await activatePlan(userId, planId as 'initial' | 'professional', 'mercadopago', subscription.id)
    } else {
      destination.searchParams.set('error', `La suscripción todavía está ${subscription.status}.`)
    }
  } catch (error) {
    console.error('[mercadopago] return sync failed', { externalId, error: error instanceof Error ? error.message : 'unknown error' })
    destination.searchParams.set('error', 'No pudimos sincronizar la suscripción con Mercado Pago.')
  }

  return NextResponse.redirect(destination)
}
