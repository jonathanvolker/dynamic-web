import type { SectionProps } from './types'
import { SectionHeading } from './SectionHeading'
import { resolveHref } from '../../links'

export function PricingSection({ section, anchor, anchors = [] }: SectionProps) {
  return <section id={anchor} className="section wrap pricing">
    <SectionHeading section={section} />
    <div className="pricing-grid">
      {section.plans?.map((plan, index) => {
        const href = resolveHref(plan.buttonHref, anchors)
        return <article key={index} className={`pricing-card${plan.featured ? ' featured' : ''}`}>
          <div className="plan-heading"><h3>{plan.title}</h3>{plan.featured && <span className="plan-badge">Destacado</span>}</div>
          <p className="plan-description">{plan.description}</p>
          <p className="plan-price">{plan.price}</p><p className="plan-period">{plan.period}</p>
          <ul>{plan.features.split('\n').map(item => item.trim()).filter(Boolean).map((item, itemIndex) => <li key={itemIndex}><span aria-hidden="true">✓</span>{item}</li>)}</ul>
          {href && plan.buttonLabel && <a className="button" href={href}>{plan.buttonLabel}<span>↗</span></a>}
        </article>
      })}
    </div>
  </section>
}
