'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/features/auth/server/session'
import { listPlans, updateSubscription } from './server/repository'

export async function changeSubscription(form: FormData) {
  await requireAdmin()
  const subscriptionId = String(form.get('subscriptionId') || '')
  const planId = String(form.get('planId') || '')
  const status = String(form.get('status') || '')
  if (!subscriptionId || !listPlans().some(plan => plan.id === planId)) return
  updateSubscription(subscriptionId, planId, status)
  revalidatePath('/admin/platform')
}
