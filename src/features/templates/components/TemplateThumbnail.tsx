import type { TemplateDefinition } from '../types'

export function TemplateThumbnail({ template }: { template: TemplateDefinition }) {
  const hero = template.sections.find(section => section.blockType === 'hero')!
  if (template.familyId === 'immersive') return <div className={`template-thumbnail thumbnail-immersive thumbnail-${template.id}`} aria-hidden="true">
    <img className="thumbnail-photo" src={hero.image?.url} alt="" loading="lazy" />
    <div className="thumbnail-nav"><strong>{template.settings.brand}</strong><span>EL REFUGIO &nbsp; DESCUBRIR &nbsp; ↗</span></div>
    <div className="thumbnail-immersive-copy"><span>{hero.eyebrow}</span><strong>{hero.title}</strong><i>{hero.buttonLabel} ↗</i></div>
    {template.id === 'coast' && <span className="thumbnail-sun" />}
    {template.id === 'atelier' && <span className="thumbnail-frame" />}
  </div>
  if (template.familyId === 'modular') return <div className={`template-thumbnail thumbnail-modular thumbnail-${template.id === 'product' ? 'product-template' : template.id}`} aria-hidden="true">
    <div className="thumbnail-nav"><strong>{template.settings.brand}<b>▰</b></strong><span>BENEFICIOS &nbsp; PLANES &nbsp; ↗</span></div>
    <div className="thumbnail-modular-copy"><span>{hero.eyebrow}</span><strong>{hero.title}</strong><i>{hero.buttonLabel} ↗</i></div>
    {template.id === 'product' ? <div className="thumbnail-vector-product"><span /><span /><span /></div>
      : <div className="thumbnail-product"><div /><div><span /><span /><span /></div></div>}
    {template.id === 'launch' && <span className="thumbnail-orbit">✦</span>}
    {template.id === 'scale' && <span className="thumbnail-axis">↗</span>}
  </div>
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
