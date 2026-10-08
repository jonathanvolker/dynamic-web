import Link from 'next/link'
import { requireAdmin } from '@/features/auth/server/session'
import { adminStats } from '@/features/admin/server/repository'
import { changeSubscription } from '@/features/billing/actions'
import { listAdminSubscriptions } from '@/features/billing/server/repository'
import { planCatalog } from '@/features/billing/plans'

export const dynamic = 'force-dynamic'

export default async function AdminPlatformPage() {
  const admin = await requireAdmin()
  const stats = await adminStats()
  const subscriptions = await listAdminSubscriptions()
  return <main className="platform admin-page">
    <header className="p-header"><Link href="/dashboard" className="p-logo">forma<span>✳</span></Link><div className="admin-nav"><span>{admin.email}</span><Link href="/dashboard" className="text-link">Volver a la plataforma ↗</Link></div></header>
    <main className="admin-main">
      <div className="admin-heading"><div><span className="p-kicker">FORMA · ADMINISTRACIÓN</span><h1>Lo que pasa en Forma.</h1><p>Usuarios, sitios y suscripciones en un mismo lugar.</p></div><span className="admin-mark">✳</span></div>
      <div className="admin-metrics"><article><span>CUENTAS</span><strong>{stats.users}</strong><small>usuarios registrados</small></article><article><span>SITIOS</span><strong>{stats.sites}</strong><small>{stats.published} publicados</small></article><article><span>SUSCRIPCIONES</span><strong>{stats.subscriptions}</strong><small>activas o en prueba</small></article></div>
      <section className="admin-table-section"><div className="admin-section-heading"><div><span className="p-kicker">USUARIOS</span><h2>Qué tiene cada cuenta</h2></div><Link className="p-button secondary admin-small-button" href="/planes">Ver planes ↗</Link></div>
        <div className="admin-users-table"><div className="admin-users-head"><span>USUARIO</span><span>PLAN Y ESTADO</span><span>SITIOS</span></div>{stats.usersList.map(account => <div className="admin-user-row" key={account.id}><div><strong>{account.name}</strong><small>{account.email}</small></div><div><b>{account.plan_id === 'none' ? 'Sin plan' : account.plan_id}</b><small className={`admin-status ${account.subscription_status}`}>{account.subscription_status}</small></div><div><strong>{account.site_count}</strong><small>{account.published_count} publicados</small></div></div>)}</div>
      </section>
      <section className="admin-table-section admin-plans-section"><div className="admin-section-heading"><div><span className="p-kicker">GESTIÓN MANUAL</span><h2>Suscripciones</h2></div></div>
        <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Usuario</th><th>Plan</th><th>Estado</th><th>Proveedor</th><th>Actualizar</th></tr></thead><tbody>{subscriptions.map(subscription => <tr key={subscription.subscription_id}><td><strong>{subscription.user_name}</strong><small>{subscription.email}</small></td><td>{subscription.name}</td><td>{subscription.status}</td><td>{subscription.provider}</td><td><form action={changeSubscription} className="admin-subscription-form"><input type="hidden" name="subscriptionId" value={subscription.subscription_id} /><select name="planId" defaultValue={subscription.id}>{Object.values(planCatalog).map(plan => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select><select name="status" defaultValue={subscription.status}><option value="active">Activo</option><option value="trialing">Prueba</option><option value="past_due">Pago pendiente</option><option value="canceled">Cancelado</option><option value="expired">Vencido</option></select><button className="p-button secondary">Guardar</button></form></td></tr>)}</tbody></table></div>
      </section>
    </main>
  </main>
}
