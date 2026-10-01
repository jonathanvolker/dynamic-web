import Link from 'next/link'
import type { Site } from '../types'
import { unpublishSite } from '../actions'
import { DeleteSiteButton } from './DeleteSiteButton'

export function SiteCard({ site }: { site: Site }) {
  return (
    <article className="site-tile">
      <Link href={`/editor/${site.id}`} className="site-thumbnail" style={{ background: site.draft.settings.accent }}>
        <span>{site.draft.settings.brand}</span><b>✳</b><small>ABRIR EDITOR ↗</small>
      </Link>
      <div className="site-info">
        <div><h2>{site.name}</h2><span className={`status-pill ${site.published ? 'live' : ''}`}>{site.published ? '● Publicado' : '○ Borrador'}</span></div>
        <p>/s/{site.slug}</p>
        <div className="site-actions">
          <Link href={`/editor/${site.id}`}>Editar sitio ↗</Link>
          {site.published && <a href={`/s/${site.slug}`} target="_blank" rel="noreferrer">Ver web ↗</a>}
        </div>
        <div className="site-danger-actions">
          {site.published && <form action={unpublishSite.bind(null, site.id)}><button className="unpublish">Retirar publicación</button></form>}
          <DeleteSiteButton siteId={site.id} siteName={site.name} />
        </div>
      </div>
    </article>
  )
}
