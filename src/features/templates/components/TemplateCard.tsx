import Link from 'next/link'
import type { TemplateDefinition } from '../types'
import { TemplateThumbnail } from './TemplateThumbnail'

export function TemplateCard({ template }: { template: TemplateDefinition }) {
  return (
    <article className="catalog-card">
      <Link href={`/templates/${template.id}`} aria-label={`Ver la plantilla ${template.name}`}><TemplateThumbnail template={template} /></Link>
      <div className="catalog-card-info">
        <span className="p-kicker">{template.category}</span>
        <h2>{template.name}<span>{template.icon}</span></h2>
        <p>{template.description}</p>
        <div className="catalog-card-actions">
          <Link className="p-button secondary" href={`/templates/${template.id}`}>Ver plantilla ↗</Link>
          <Link className="text-link" href={`/register?template=${template.id}`}>Usar esta base →</Link>
        </div>
      </div>
    </article>
  )
}
