import Link from 'next/link'
import { requireUser } from '@/features/auth/server/session'
import NewSiteForm from '@/features/sites/components/NewSiteForm'
import { getTemplate } from '@/features/templates/registry'
import { getEntitlements } from '@/features/billing/server/access'
import { listSites } from '@/features/sites/server/repository'

export default async function NewSite({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  const user = await requireUser()
  const requestedTemplate = (await searchParams).template || 'studio'
  const selected = getTemplate(requestedTemplate)
  const entitlements = getEntitlements(user.id)
  const siteCount = listSites(user.id).length
  const atLimit = siteCount >= entitlements.plan.maxSites
  return (
    <main className="platform new-site-page">
      <Link href="/dashboard" className="text-link">← Mis sitios</Link>
      <span className="p-kicker">DE IDEA A SITIO</span>
      <h1>Algo nuevo empieza.</h1>
      <p>Un nombre, una base y todo lo que quieras construir.</p>
      {atLimit && <div className="plan-limit-warning" role="status"><strong>Llegaste al límite de tu plan {entitlements.plan.name}.</strong><span>Ya tenés {siteCount} de {entitlements.plan.maxSites} sitio{entitlements.plan.maxSites === 1 ? '' : 's'} disponibles.</span><Link href="/planes">Ver planes ↗</Link></div>}
      <NewSiteForm key={requestedTemplate} selectedTemplate={requestedTemplate === 'blank' ? 'blank' : selected?.id} availableBlocks={entitlements.plan.allowedBlocks === 'all' ? null : entitlements.plan.allowedBlocks} />
    </main>
  )
}
