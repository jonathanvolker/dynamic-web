import Link from 'next/link'
import type { User } from '@/features/auth/types'
import { logout } from '@/features/auth/actions'
import type { Site } from '../types'
import { SiteCard } from './SiteCard'

export function DashboardView({ user, sites }: { user: User; sites: Site[] }) {
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
          </div>
          <Link className="p-button primary" href="/dashboard/new">+ Crear un sitio</Link>
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
