import type { SectionProps } from './types'

export function ContactSection({ section, anchor, buttonHref, buttonInvalid, preview }: SectionProps) {
  return (
    <section id={anchor} className="contact wrap">
      <p className="eyebrow">{section.eyebrow}</p>
      <div className="contact-heading">
        <h2>{section.title}</h2>{buttonHref ? <a href={buttonHref} className="contact-arrow" aria-label={section.buttonLabel || 'Contactar'}>↗</a> : preview && buttonInvalid ? <span className="contact-arrow editor-invalid-link" title="El destino de este botón no existe" aria-label="Destino no válido">⚠</span> : null}
      </div>
      <div className="contact-bottom">
        <p>{section.description}</p>{section.buttonLabel && (buttonHref ? <a className="button dark" href={buttonHref}>{section.buttonLabel}<span>↗</span></a> : preview && buttonInvalid ? <span className="button dark editor-invalid-link" title="El destino de este botón no existe">{section.buttonLabel}<span>⚠ Destino no válido</span></span> : null)}
      </div>
    </section>
  )
}
