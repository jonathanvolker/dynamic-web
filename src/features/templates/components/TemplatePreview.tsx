import Link from 'next/link'
import SiteView from '@/features/website/components/SiteView'
import type { TemplateDefinition } from '../types'

export function TemplatePreview({ template }: { template: TemplateDefinition }) {
  return (
    <>
      <div className="platform template-preview-bar">
        <Link href="/templates" className="text-link">← Todas las plantillas</Link>
        <span><strong>{template.name}</strong><small>VISTA PREVIA · CONTENIDO DE EJEMPLO</small></span>
        <Link className="p-button primary" href={`/register?template=${template.id}`}>Usar plantilla ↗</Link>
      </div>
      <SiteView settings={template.settings} sections={template.sections} familyId={template.familyId} demo />
    </>
  )
}
