import Link from 'next/link'
import { requireUser } from '@/features/auth/server/session'
import { getEntitlements } from '@/features/billing/server/access'
import { addCustomDomain } from '@/features/domains/actions'
import { DomainVerifyButton } from '@/features/domains/components/DomainVerifyButton'
import { listDomainsForOwner } from '@/features/domains/server/repository'
import { listSites } from '@/features/sites/server/repository'

export const dynamic = 'force-dynamic'

export default async function DomainsPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const user = await requireUser()
  const entitlements = await getEntitlements(user.id)
  const domains = await listDomainsForOwner(user.id)
  const sites = await listSites(user.id)
  const messages = await searchParams
  return <main className="platform domains-page"><header className="p-header"><Link href="/dashboard" className="p-logo">forma<span>✳</span></Link><Link href="/dashboard" className="text-link">Volver a mis sitios ↗</Link></header><main className="domains-main">
    <div className="domains-heading"><div><span className="p-kicker">PROFESIONAL · DIRECCIONES</span><h1>Tu marca, en su propia casa.</h1><p>Conectá un dominio que ya sea tuyo y hacé que tu sitio sea fácil de encontrar.</p></div><span className="domain-mark">◎</span></div>
    {!entitlements.plan.customDomain ? <section className="domain-upgrade"><span className="domain-upgrade-icon">◎</span><div><span className="p-kicker">FUNCIÓN PROFESIONAL</span><h2>Usá tu propio dominio.</h2><p>El dominio personalizado está incluido en Profesional. Tu dominio sigue siendo tuyo; Forma solo conecta y sirve tu sitio.</p><Link className="p-button primary" href="/planes">Ver Profesional ↗</Link></div></section> : <>
      {messages.error && <p className="p-error">{messages.error}</p>}{messages.success && <p className="domain-success">{messages.success}</p>}
      <section className="domain-add-card"><div><span className="p-kicker">NUEVA DIRECCIÓN</span><h2>Conectá un dominio</h2><p>Necesitás agregar un registro CNAME desde el panel de tu proveedor.</p></div><form action={addCustomDomain} className="domain-form"><label>Sitio<select name="siteId" required>{sites.length ? sites.map(site => <option key={site.id} value={site.id}>{site.name}</option>) : <option value="">Creá un sitio primero</option>}</select></label><label>Dominio<input name="hostname" placeholder="www.tumarca.com" required /></label><button className="p-button primary" disabled={!sites.length}>Agregar dominio <span>↗</span></button></form></section>
      <section className="domain-list"><div className="domain-list-heading"><div><span className="p-kicker">TUS DOMINIOS</span><h2>Direcciones conectadas <sup>{domains.length}</sup></h2></div></div>{domains.length ? domains.map(domain => <article className="domain-card" key={domain.id}><div className="domain-card-top"><div><strong>{domain.hostname}</strong><small>{domain.site_name}</small></div><span className={`domain-status ${domain.status}`}>{domain.status === 'pending' ? 'Pendiente' : domain.status === 'verified' ? 'Verificado' : domain.status}</span></div>{domain.status === 'pending' && <div className="domain-instructions"><p>Creá este registro en tu proveedor de dominio:</p><div className="dns-row"><span><small>TIPO</small>CNAME</span><span><small>NOMBRE</small>www</span><span><small>APUNTA A</small>{process.env.FORMA_CNAME_TARGET || 'tu-host-de-forma.com'}</span></div><p className="domain-token">Token de verificación: <code>{domain.verification_token}</code></p><DomainVerifyButton id={domain.id} /></div>}</article>) : <div className="domain-empty"><span>◎</span><p>Todavía no conectaste ningún dominio.</p></div>}</section>
    </>}
  </main></main>
}
