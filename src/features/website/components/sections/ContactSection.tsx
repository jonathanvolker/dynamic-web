import type { SectionProps } from './types'

export function ContactSection({ section, anchor, buttonHref, buttonInvalid, preview }: SectionProps) {
  return (
    <section id={anchor} className="contact wrap">
       <p className="eyebrow" data-forma-field="eyebrow">{section.eyebrow}</p>
      <div className="contact-heading">
         <h2 data-forma-field="title">{section.title}</h2>{buttonHref ? <a href={buttonHref} className="contact-arrow" data-forma-field="buttonLabel" aria-label={section.buttonLabel || 'Contactar'}>↗</a> : preview && buttonInvalid ? <span className="contact-arrow editor-invalid-link" data-forma-field="buttonLabel" title="El destino de este botón no existe" aria-label="Destino no válido">⚠</span> : null}
      </div>
      <div className="contact-bottom">
         <p data-forma-field="description">{section.description}</p>{section.buttonLabel && (buttonHref ? <a className="button dark" data-forma-field="buttonLabel" href={buttonHref}>{section.buttonLabel}<span>↗</span></a> : preview && buttonInvalid ? <span className="button dark editor-invalid-link" data-forma-field="buttonLabel" title="El destino de este botón no existe">{section.buttonLabel}<span>⚠ Destino no válido</span></span> : null)}
      </div>
    </section>
  )
}
