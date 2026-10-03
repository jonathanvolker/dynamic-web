'use server'

import { requireUser } from '@/features/auth/server/session'
import { getEntitlements } from '@/features/billing/server/access'
import { findSite } from '@/features/sites/server/repository'
import { createDomain } from './server/repository'
import { redirect } from 'next/navigation'

export async function addCustomDomain(form: FormData): Promise<void> {
  const user = await requireUser()
  const entitlements = getEntitlements(user.id)
  if (!entitlements.plan.customDomain) redirect('/dashboard/domains?error=El+dominio+personalizado+está+disponible+en+el+plan+Profesional.')
  const siteId = String(form.get('siteId') || '')
  const site = findSite(siteId, user.id)
  if (!site) redirect('/dashboard/domains?error=No+encontramos+ese+sitio.')
  const hostname = String(form.get('hostname') || '').trim().toLowerCase().replace(/\.$/, '')
  if (!/^(www\.)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(hostname)) redirect('/dashboard/domains?error=Ingresá+un+dominio+válido+con+www.')
  let domain: { verification_token: string }
  try {
    domain = createDomain(site.id, hostname) as { verification_token: string }
  } catch {
    redirect('/dashboard/domains?error=Ese+dominio+ya+está+registrado+o+no+se+pudo+guardar.')
  }
  redirect(`/dashboard/domains?success=Dominio+agregado.+Token+${domain.verification_token}`)
}
