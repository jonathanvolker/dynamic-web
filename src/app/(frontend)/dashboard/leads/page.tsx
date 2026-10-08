import { requireUser } from '@/features/auth/server/session'
import { listLeads, markLeadsRead } from '@/features/sites/server/leads'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function LeadsPage() {
  const user = await requireUser()
  const leads = listLeads(user.id)
  markLeadsRead(user.id)
  return <div className="platform dashboard"><header className="p-header"><Link href="/dashboard" className="p-logo">forma<span>✳</span></Link><Link href="/dashboard" className="text-link">Volver a mis sitios</Link></header><main className="dashboard-main"><div className="dashboard-heading"><div><span className="p-kicker">CONTACTOS RECIBIDOS</span><h1>Bandeja de leads<span className="site-count">{leads.length}</span></h1><p>Consultas y suscripciones enviadas desde tus sitios publicados.</p></div></div>{leads.length ? <div className="lead-inbox">{leads.map(lead => <article className="lead-card" key={lead.id}><header><div><strong>{lead.kind === 'contact' ? 'Consulta de contacto' : 'Suscripción al newsletter'}</strong><span>{lead.siteName}</span></div><time dateTime={lead.createdAt}>{new Date(lead.createdAt).toLocaleString('es-AR')}</time></header><dl>{Object.entries(lead.values).filter(([key]) => key !== 'website').map(([key, value]) => <div key={key}><dt>{key === 'message' ? 'Mensaje' : key === 'consent' ? 'Consentimiento' : key}</dt><dd>{value}</dd></div>)}</dl><Link href={`/s/${lead.siteSlug}`} target="_blank">Ver sitio ↗</Link></article>)}</div> : <div className="empty-state"><span>◎</span><h2>Tu bandeja está vacía.</h2><p>Los nuevos contactos de tus formularios aparecerán acá.</p></div>}</main></div>
}
