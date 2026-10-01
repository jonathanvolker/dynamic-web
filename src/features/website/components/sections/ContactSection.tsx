import type { SectionProps } from './types'

export function ContactSection({ section, anchor, buttonHref }: SectionProps) {
  return (
    <section id={anchor} className="contact wrap">
      <p className="eyebrow">{section.eyebrow}</p>
      <div className="contact-heading">
        <h2>{section.title}</h2>{buttonHref && <a href={buttonHref} className="contact-arrow" aria-label={section.buttonLabel || 'Contactar'}>↗</a>}
      </div>
      <div className="contact-bottom">
        <p>{section.description}</p>{buttonHref && section.buttonLabel && <a className="button dark" href={buttonHref}>{section.buttonLabel}<span>↗</span></a>}
      </div>
    </section>
  )
}
