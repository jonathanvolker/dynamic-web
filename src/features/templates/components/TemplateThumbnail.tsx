import type { TemplateDefinition } from '../types'

export function TemplateThumbnail({ template }: { template: TemplateDefinition }) {
  const hero = template.sections.find(section => section.blockType === 'hero')!
  return (
    <div className={`template-thumbnail thumbnail-${template.id}`} aria-hidden="true">
      <div className="thumbnail-nav"><strong>{template.settings.brand}</strong><span>Servicios &nbsp; Nosotros &nbsp; ↗</span></div>
      <div className="thumbnail-content">
        <div className="thumbnail-copy"><span>{template.category}</span><strong>{hero.title}</strong><i>Conocé más ↗</i></div>
        <div className="thumbnail-art">
          {template.id === 'restaurant' ? <div className="thumbnail-plate"><i /><i /><i /></div>
            : template.id === 'consultant' ? <div className="thumbnail-chart"><span>HOJA DE RUTA ↗</span><i /><i /><i /><i /></div>
              : <span className="thumbnail-star">✳</span>}
        </div>
      </div>
      <div className="thumbnail-lines"><span /><span /><span /></div>
    </div>
  )
}
