import { requireAdmin } from '@/features/auth/server/session'
import { listAdminSubscriptions, listPlans } from '@/features/billing/server/repository'
import { changeSubscription } from '@/features/billing/actions'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const money = (cents: number, currency: string) => cents === 0 ? 'Gratis' : new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(cents / 100)

export default async function AdminPlatformPage() {
  const admin = await requireAdmin()
  const subscriptions = listAdminSubscriptions()
  const plans = listPlans()
  return <div className="platform dashboard"><header className="p-header"><Link href="/dashboard" className="p-logo">forma<span>✳</span></Link><div className="account"><span>{admin.email}</span><Link href="/dashboard" className="text-link">Volver al dashboard</Link></div></header><main className="dashboard-main"><div className="dashboard-heading"><div><span className="p-kicker">ADMINISTRACIÓN</span><h1>Usuarios y suscripciones<span className="site-count">{subscriptions.length}</span></h1><p>Gestión manual inicial. Los pagos automáticos se conectarán después mediante webhooks.</p></div></div><div className="subscription-plans">{plans.map(plan => <article key={plan.id}><strong>{plan.name}</strong><b>{money(plan.priceCents, plan.currency)}<small> / {plan.interval}</small></b><span>{plan.siteLimit} sitio{plan.siteLimit === 1 ? '' : 's'} · {plan.storageLimitMb} MB</span></article>)}</div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Usuario</th><th>Plan</th><th>Estado</th><th>Proveedor</th><th>Actualizar</th></tr></thead><tbody>{subscriptions.map(subscription => <tr key={subscription.subscriptionId}><td><strong>{subscription.userName}</strong><small>{subscription.email}</small></td><td>{subscription.name}</td><td>{subscription.status}</td><td>{subscription.provider}</td><td><form action={changeSubscription} className="admin-subscription-form"><input type="hidden" name="subscriptionId" value={subscription.subscriptionId} /><select name="planId" defaultValue={subscription.id}>{plans.map(plan => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select><select name="status" defaultValue={subscription.status}><option value="active">Activo</option><option value="trialing">Prueba</option><option value="past_due">Vencido</option><option value="canceled">Cancelado</option><option value="unpaid">Impago</option></select><button className="p-button secondary">Guardar</button></form></td></tr>)}</tbody></table></div></main></div>
}
