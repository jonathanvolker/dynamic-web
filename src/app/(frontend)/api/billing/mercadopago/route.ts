import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { activatePlan, recordBillingEvent, updateSubscriptionStatus } from '@/features/billing/server/repository'
import { fetchMercadoPagoSubscription } from '@/features/billing/providers/mercadopago'

function validSignature(request: Request, dataId: string) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  if (!secret) return process.env.NODE_ENV !== 'production'
  const signature = request.headers.get('x-signature') || ''
  const ts = signature.match(/ts=([^,]+)/)?.[1]
  const v1 = signature.match(/v1=([^,]+)/)?.[1]
  if (!ts || !v1) return false
  const digest = createHmac('sha256', secret).update(`id:${dataId};request-id:${request.headers.get('x-request-id') || ''};ts:${ts};`).digest('hex')
  return digest.length === v1.length && timingSafeEqual(Buffer.from(digest), Buffer.from(v1))
}

export async function POST(request: Request) {
  const body = await request.text()
  let payload: { id?: string; data?: { id?: string }; type?: string; action?: string }
  try { payload = JSON.parse(body || '{}') } catch { return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 }) }
  const externalId = payload.data?.id || payload.id || new URL(request.url).searchParams.get('data.id') || new URL(request.url).searchParams.get('id')
  if (!externalId) return NextResponse.json({ received: true })
  if (!validSignature(request, externalId)) return NextResponse.json({ error: 'Firma inválida.' }, { status: 401 })
  try {
    const subscription = await fetchMercadoPagoSubscription(externalId)
    if (!recordBillingEvent('mercadopago', `${payload.type || 'event'}:${externalId}`, body)) return NextResponse.json({ received: true })
    const [userId, planId] = String(subscription.external_reference || '').split(':')
    if (!userId || !['initial', 'professional'].includes(planId)) return NextResponse.json({ received: true })
    if (subscription.status === 'authorized') activatePlan(userId, planId as 'initial' | 'professional', 'mercadopago', subscription.id)
    else if (subscription.status === 'paused' || subscription.status === 'cancelled') {
      const local = activatePlan(userId, planId as 'initial' | 'professional', 'mercadopago', subscription.id)
      if (local) updateSubscriptionStatus(local.id, 'canceled', local.current_period_ends_at)
    }
  } catch {
    return NextResponse.json({ error: 'No se pudo procesar el evento.' }, { status: 500 })
  }
  return NextResponse.json({ received: true })
}
