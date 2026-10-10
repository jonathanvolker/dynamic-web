import Link from 'next/link'
import { requireUser } from '@/features/auth/server/session'
import NewSiteForm from '@/features/sites/components/NewSiteForm'
import { getTemplate } from '@/features/templates/registry'
import { getEntitlements } from '@/features/billing/server/access'
import { listSites } from '@/features/sites/server/repository'
import { isPlatformAdmin } from '@/features/admin/server/repository'

export default async function NewSite({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  const user = await requireUser()
  if (!isPlatformAdmin(user.email, user.role)) return <main className="platform new-site-page"><Link href="/dashboard" className="text-link">← Mis sitios</Link><section className="construction-card" aria-labelledby="construction-title"><span className="construction-mark" aria-hidden="true">✳</span><span className="p-kicker">ESTAMOS PREPARANDO ALGO</span><h1 id="construction-title">Tu espacio para crear está en camino.</h1><p>Estamos mejorando la experiencia para que puedas darle forma a tu web con más libertad. La creación de sitios volverá a estar disponible muy pronto.</p><div className="construction-note"><span aria-hidden="true">☕</span><span>Mientras tanto, tus sitios existentes siguen disponibles desde tu panel.</span></div><Link href="/dashboard" className="p-button primary">Volver a mis sitios <span aria-hidden="true">↗</span></Link></section></main>
  const requestedTemplate = (await searchParams).template || 'studio'
  const selected = getTemplate(requestedTemplate)
  const entitlements = await getEntitlements(user.id)
  const siteCount = (await listSites(user.id)).length
  const atLimit = siteCount >= entitlements.plan.maxSites
  return <main className="platform new-site-page"><Link href="/dashboard" className="text-link">← Mis sitios</Link><span className="p-kicker">DE IDEA A SITIO</span><h1>Algo nuevo empieza.</h1><p>Un nombre, una base y todo lo que quieras construir.</p>{atLimit && <div className="plan-limit-warning" role="status"><strong>Llegaste al límite de tu plan {entitlements.plan.name}.</strong><span>Ya tenés {siteCount} de {entitlements.plan.maxSites} sitio{entitlements.plan.maxSites === 1 ? '' : 's'} disponibles.</span><Link href="/planes">Ver planes ↗</Link></div>}<NewSiteForm key={requestedTemplate} selectedTemplate={requestedTemplate === 'blank' ? 'blank' : selected?.id} availableBlocks={entitlements.plan.allowedBlocks === 'all' ? null : entitlements.plan.allowedBlocks} /></main>
}
