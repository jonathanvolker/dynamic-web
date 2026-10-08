import type { SectionProps } from './types'
import { SectionHeading } from './SectionHeading'
import { resolveHref } from '../../links'

export function PricingSection({ section, anchor, anchors = [], preview }: SectionProps) {
  return <section id={anchor} className="section wrap pricing">
    <SectionHeading section={section} />
    <div className="pricing-grid">
      {section.plans?.map((plan, index) => {
        const href = resolveHref(plan.buttonHref, anchors)
        return <article key={index} className={`pricing-card${plan.featured ? ' featured' : ''}`}>
           <div className="plan-heading"><h3 data-forma-field={`plans.${index}.title`}>{plan.title}</h3>{plan.featured && <span className="plan-badge" data-forma-field={`plans.${index}.featured`}>Destacado</span>}</div>
           <p className="plan-description" data-forma-field={`plans.${index}.description`}>{plan.description}</p>
           <p className="plan-price" data-forma-field={`plans.${index}.price`}>{plan.price}</p><p className="plan-period" data-forma-field={`plans.${index}.period`}>{plan.period}</p>
           <ul data-forma-field={`plans.${index}.features`}>{plan.features.split('\n').map(item => item.trim()).filter(Boolean).map((item, itemIndex) => <li key={itemIndex}><span aria-hidden="true">✓</span>{item}</li>)}</ul>
           {plan.buttonLabel && (href ? <a className="button" data-forma-field={`plans.${index}.buttonLabel`} href={href}>{plan.buttonLabel}<span>↗</span></a> : preview ? <span className="button editor-invalid-link" data-forma-field={`plans.${index}.buttonLabel`} title="El destino de este botón no existe">{plan.buttonLabel}<span>⚠ Destino no válido</span></span> : null)}
        </article>
      })}
    </div>
  </section>
}
