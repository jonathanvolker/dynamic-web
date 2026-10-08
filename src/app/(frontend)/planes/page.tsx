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
  const statusText = entitlements.subscription.status === 'trialing'
    ? `Estás usando la prueba gratuita hasta el ${new Date(entitlements.subscription.current_period_ends_at).toLocaleDateString('es-AR')}.`
    : entitlements.subscription.status === 'active'
      ? 'Este es tu plan actual.'
      : entitlements.subscription.status === 'past_due'
        ? `Tu pago está pendiente. Tenés ${entitlements.graceDaysRemaining} días para regularizarlo.`
        : entitlements.subscription.status === 'expired'
          ? 'Tu plan venció. Elegí un plan para volver a editar y publicar.'
          : 'Tu plan está cancelado. Elegí un plan para volver a publicar.'
  return <main className="platform plans-page">
    <header className="p-header"><Link href="/dashboard" className="p-logo">forma<span>✳</span></Link><div className="plans-nav"><span>{user.name}</span><Link href="/dashboard" className="text-link">Mis sitios ↗</Link></div></header>
    <section className="plans-hero"><div><span className="p-kicker">FORMA · PLANES</span><h1>Una web que<br /><em>crece con vos.</em></h1><p>Elegí lo que necesitás hoy y subí de nivel cuando tu proyecto lo pida.</p></div><div className="plans-current"><span className="p-kicker">TU ESTADO</span><strong>{entitlements.plan.name}</strong><span>{statusText}</span><Link href="#planes">Comparar planes ↓</Link></div></section>
    {error && <p className="p-error plans-error">{error}</p>}
     <section className="plans-list" id="planes"><div className="plans-list-intro"><span className="p-kicker">ELEGÍ TU NIVEL</span><h2>El plan que acompaña tu próximo paso.</h2><p>Compará lo que incluye cada opción y elegí la que mejor encaje con tu sitio.</p></div><div className="plans-chooser"><div className="plan-mobile-selector" role="tablist" aria-label="Elegí un plan">{Object.values(planCatalog).map(plan => <label key={plan.id}><input type="radio" name="mobile-plan" value={plan.id} defaultChecked={plan.id === entitlements.plan.id || (entitlements.plan.id === 'free' && plan.id === 'free')} /><span>{plan.name}</span><small>{plan.description}</small></label>)}</div><div className="plan-grid">{Object.values(planCatalog).map(plan => <article className={`plan-card plan-card-${plan.id} ${plan.id === entitlements.plan.id ? 'current' : ''} ${plan.id === 'professional' ? 'featured' : ''}`} key={plan.id}>
      {plan.id === 'professional' && <span className="plan-ribbon">PARA CRECER</span>}{plan.id === entitlements.plan.id && <span className="plan-current">PLAN ACTUAL</span>}
      <div className="plan-card-head"><span className="plan-index">0{plan.id === 'free' ? 1 : plan.id === 'initial' ? 2 : 3}</span><h2>{plan.name}</h2></div><p className="plan-description">{plan.description}</p>
      <strong className="plan-price">{plan.price ? `$ ${plan.price.toLocaleString('es-AR')}` : '30 días'}<small>{plan.price ? '/mes' : ' sin costo'}</small></strong>
       <div className="plan-rule" /><p className="plan-includes">Este plan incluye:</p><ul>{plan.features.map(feature => <li key={feature}><span>+</span>{feature}</li>)}</ul>
       {plan.id === 'free' ? <span className="plan-note">Se activa automáticamente al registrarte.</span> : plan.id === entitlements.plan.id && ['active', 'trialing', 'past_due'].includes(entitlements.subscription.status) ? <span className="plan-note">Este es tu plan actual.</span> : entitlements.plan.id === 'professional' && plan.id === 'initial' && ['active', 'trialing', 'past_due'].includes(entitlements.subscription.status) ? <span className="plan-note">El cambio a un plan inferior estará disponible cuando termine tu período actual.</span> : <form action={startCheckout.bind(null, plan.id)}><button className="p-button primary">Elegir {plan.name}<span>↗</span></button></form>}
     </article>)}</div></div></section>
    <footer className="plans-footer"><span>¿Necesitás ayuda para elegir?</span><a href="mailto:hola@forma.ar">Hablemos de tu proyecto ↗</a></footer>
  </main>
}
