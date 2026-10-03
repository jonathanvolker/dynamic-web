import Link from 'next/link'
import type { User } from '@/features/auth/types'
import { logout } from '@/features/auth/actions'
import type { Site } from '../types'
import { SiteCard } from './SiteCard'
import type { Entitlements } from '@/features/billing/types'
import { isPlatformAdmin } from '@/features/admin/server/repository'

export function DashboardView({ user, sites, entitlements }: { user: User; sites: Site[]; entitlements: Entitlements }) {
  return (
    <div className="platform dashboard">
      <header className="p-header">
        <Link href="/" className="p-logo">forma<span>✳</span></Link>
        <div className="account"><span>{user.name}</span><form action={logout}><button className="text-link">Salir ↗</button></form></div>
      </header>
      <main className="dashboard-main">
        <div className="dashboard-heading">
          <div>
            <span className="p-kicker">TU ESPACIO CREATIVO</span>
            <h1>Mis sitios<span className="site-count">{sites.length}</span></h1>
            <p>Ideas que ya tienen un lugar. Y las que están por venir.</p>
            <p className="plan-status"><strong>Plan {entitlements.plan.name}</strong> · {entitlements.subscription.status === 'trialing' ? `trial: ${entitlements.graceDaysRemaining || Math.max(0, Math.ceil((new Date(entitlements.subscription.current_period_ends_at).getTime() - Date.now()) / 86400000))} días restantes` : entitlements.subscription.status === 'past_due' ? `pago pendiente: ${entitlements.graceDaysRemaining} días` : entitlements.subscription.status}</p>
          </div>
          <div className="dashboard-actions"><Link className="p-button secondary dashboard-secondary-button" href="/planes">Ver planes ↗</Link><Link className="p-button secondary dashboard-secondary-button" href="/dashboard/domains">Dominios ↗</Link>{isPlatformAdmin(user.email) && <Link className="p-button secondary dashboard-secondary-button" href="/admin/platform">Admin ↗</Link>}{entitlements.canCreateSite && <Link className="p-button primary" href="/dashboard/new">+ Crear un sitio</Link>}</div>
        </div>
        {sites.length ? (
          <div className="site-grid">{sites.map(site => <SiteCard key={site.id} site={site} />)}</div>
        ) : (
          <div className="empty-state">
            <span>✳</span><h2>Todo empieza con una idea.</h2><p>Tu primera web está a unos clics de distancia.</p>
            <Link className="p-button primary" href="/dashboard/new">Crear mi primera web ↗</Link>
          </div>
        )}
        <div className="domain-note">
          <span>◎</span><div><strong>Una dirección para cada web.</strong>
            <p>Cada sitio publicado tiene su propia URL local. La conexión de dominios y HTTPS se configura en la siguiente etapa, al desplegar la plataforma.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
