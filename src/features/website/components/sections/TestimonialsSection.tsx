import type { SectionProps } from './types'
import { SectionHeading } from './SectionHeading'

export function TestimonialsSection({ section, anchor }: SectionProps) {
  return <section id={anchor} className="section wrap testimonials">
    <SectionHeading section={section} />
    <div className="testimonial-grid">
      {section.testimonials?.map((item, index) => <figure className="testimonial-card" key={index}>
        <span className="quote-mark" aria-hidden="true">“</span>
        <blockquote>{item.quote}</blockquote>
        <figcaption><span className="person-initial" aria-hidden="true">{item.name.slice(0, 1)}</span><span><strong>{item.name}</strong><small>{item.role}</small></span></figcaption>
      </figure>)}
    </div>
  </section>
}
