import 'server-only'
import type { PlanId } from '../types'
import { getPlan } from '../plans'

type CheckoutInput = { userId: string; email: string; planId: PlanId; returnUrl: string }

export async function createMercadoPagoCheckout(input: CheckoutInput) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!token) throw new Error('Mercado Pago todavía no está configurado.')
  const response = await fetch('https://api.mercadopago.com/preapproval', {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reason: `Suscripción Forma ${input.planId}`,
      external_reference: `${input.userId}:${input.planId}`,
      payer_email: input.email,
      auto_recurring: { frequency: 1, frequency_type: 'months', transaction_amount: getPlan(input.planId).price, currency_id: 'ARS' },
      back_url: input.returnUrl,
      notification_url: process.env.MERCADOPAGO_WEBHOOK_URL || `${input.returnUrl.replace(/\/planes$/, '')}/api/billing/mercadopago`,
      status: 'pending',
    }),
  })
  const responseBody = await response.text()
  let data: { init_point?: string; sandbox_init_point?: string; message?: string; error?: string; cause?: { description?: string; code?: string }[] }
  try {
    data = JSON.parse(responseBody) as typeof data
  } catch {
    data = {}
  }
  if (!response.ok) {
    const cause = data.cause?.map(item => item.description || item.code).filter(Boolean).join(', ')
    const reason = cause || data.message || data.error
    console.error('[mercadopago] checkout rejected', {
      status: response.status,
      reason,
      accessTokenConfigured: Boolean(token),
      accessTokenMode: token?.startsWith('TEST-') ? 'test' : token ? 'production-or-unknown' : 'missing',
      planId: input.planId,
      amount: getPlan(input.planId).price,
    })
    throw new Error(reason ? `Mercado Pago rechazó el checkout: ${reason}` : `Mercado Pago rechazó el checkout (HTTP ${response.status}).`)
  }
  if (!data.init_point && !data.sandbox_init_point) throw new Error('Mercado Pago no devolvió una URL de checkout.')
  return data.init_point || data.sandbox_init_point!
}

export async function fetchMercadoPagoSubscription(id: string) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!token) throw new Error('Mercado Pago no está configurado.')
  const response = await fetch(`https://api.mercadopago.com/preapproval/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
  if (!response.ok) throw new Error('No se pudo consultar la suscripción en Mercado Pago.')
  return response.json() as Promise<{ id: string; status: string; external_reference?: string; payer_email?: string; auto_recurring?: { transaction_amount?: number } }>
}
