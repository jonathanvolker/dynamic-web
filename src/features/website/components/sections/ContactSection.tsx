import type { SectionProps } from './types'

export function ContactSection({ section, settings, anchor }: SectionProps) {
  const email = `mailto:${settings.email}`
  return (
    <section id={anchor} className="contact wrap">
      <p className="eyebrow">{section.eyebrow}</p>
      <div className="contact-heading">
        <h2>{section.title}</h2><a href={email} className="contact-arrow" aria-label="Enviar un email">↗</a>
      </div>
      <div className="contact-bottom">
        <p>{section.description}</p><a className="button dark" href={email}>{section.buttonLabel}<span>↗</span></a>
      </div>
    </section>
  )
}
