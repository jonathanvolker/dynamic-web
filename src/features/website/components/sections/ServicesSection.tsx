import type { SectionProps } from './types'
import { SectionHeading } from './SectionHeading'

export function ServicesSection({ section, anchor }: SectionProps) {
  return (
    <section id={anchor} className="section wrap services">
      <SectionHeading section={section} />
      <div className="service-grid">
        {section.services?.map((item, index) => (
          <article className="service" key={index}>
            <div className="service-top">
              <span>0{index + 1}</span>
              <span className="service-symbol" aria-hidden="true">{['✳', '↗', '◉'][index % 3]}</span>
            </div>
            <h3>{item.title}</h3><p>{item.description}</p><div className="service-tags">{item.tags}</div>
          </article>
        ))}
      </div>
    </section>
  )
}
