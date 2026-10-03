import Link from 'next/link'
import { requireUser } from '@/features/auth/server/session'
import { getEntitlements } from '@/features/billing/server/access'
import { planCatalog } from '@/features/billing/plans'
import { startCheckout } from '@/features/billing/actions'

export const dynamic = 'force-dynamic'

export default async function PlansPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser()
  const entitlements = getEntitlements(user.id)
  const { error } = await searchParams
  return <main className="platform plans-page">
    <header className="p-header"><Link href="/dashboard" className="p-logo">forma<span>✳</span></Link><div className="plans-nav"><span>{user.name}</span><Link href="/dashboard" className="text-link">Mis sitios ↗</Link></div></header>
    <section className="plans-hero"><div><span className="p-kicker">FORMA · PLANES</span><h1>Una web que<br /><em>crece con vos.</em></h1><p>Empezá sin fricción y elegí las herramientas que necesitás cuando tu proyecto esté listo para dar el siguiente paso.</p></div><div className="plans-current"><span className="p-kicker">TU ESTADO</span><strong>{entitlements.plan.name}</strong><span>{entitlements.subscription.status === 'trialing' ? `Prueba activa hasta el ${new Date(entitlements.subscription.current_period_ends_at).toLocaleDateString('es-AR')}` : entitlements.subscription.status === 'past_due' ? `${entitlements.graceDaysRemaining} días para regularizar el pago` : 'Suscripción activa'}</span><Link href="#planes">Comparar planes ↓</Link></div></section>
    {error && <p className="p-error plans-error">{error}</p>}
    <section className="plans-list" id="planes"><div className="plans-list-intro"><span className="p-kicker">ELEGÍ TU NIVEL</span><h2>Lo esencial, sin letra chica.</h2><p>Precios en pesos argentinos. Podés cambiar de plan cuando quieras.</p></div><div className="plan-grid">{Object.values(planCatalog).map(plan => <article className={`plan-card ${plan.id === entitlements.plan.id ? 'current' : ''} ${plan.id === 'professional' ? 'featured' : ''}`} key={plan.id}>
      {plan.id === 'professional' && <span className="plan-ribbon">PARA CRECER</span>}{plan.id === entitlements.plan.id && <span className="plan-current">PLAN ACTUAL</span>}
      <div className="plan-card-head"><span className="plan-index">0{plan.id === 'free' ? 1 : plan.id === 'initial' ? 2 : 3}</span><h2>{plan.name}</h2></div><p className="plan-description">{plan.description}</p>
      <strong className="plan-price">{plan.price ? `$ ${plan.price.toLocaleString('es-AR')}` : '30 días'}<small>{plan.price ? '/mes' : ' sin costo'}</small></strong>
      <div className="plan-rule" /><p className="plan-includes">Este plan incluye:</p><ul>{plan.features.map(feature => <li key={feature}><span>+</span>{feature}</li>)}</ul>
      {plan.id === 'free' ? <span className="plan-note">Se activa automáticamente al registrarte.</span> : <form action={startCheckout.bind(null, plan.id)}><button className="p-button primary">Elegir {plan.name}<span>↗</span></button></form>}
    </article>)}</div></section>
    <footer className="plans-footer"><span>¿Necesitás ayuda para elegir?</span><a href="mailto:hola@forma.ar">Hablemos de tu proyecto ↗</a></footer>
  </main>
}
