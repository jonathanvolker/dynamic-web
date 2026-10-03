'use server'

import { redirect } from 'next/navigation'
import { currentUser } from '@/features/auth/server/session'
import { createMercadoPagoCheckout } from './providers/mercadopago'
import type { PlanId } from './types'

export async function startCheckout(planId: PlanId, _formData?: FormData): Promise<void> {
  const user = await currentUser()
  if (!user) redirect('/login')
  if (planId === 'free') redirect('/dashboard')
  let url: string
  try {
    url = await createMercadoPagoCheckout({ userId: user.id, email: user.email, planId, returnUrl: `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/planes` })
  } catch (error) {
    redirect(`/planes?error=${encodeURIComponent(error instanceof Error ? error.message : 'No pudimos iniciar el checkout.')}`)
  }
  redirect(url)
}
