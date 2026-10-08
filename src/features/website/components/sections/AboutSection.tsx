import type { SectionProps } from './types'

export function AboutSection({ section, settings, anchor }: SectionProps) {
  return (
    <section id={anchor} className="about">
      <div className="wrap about-grid">
        {section.image?.url ? <div className="about-media" data-forma-field="image"><img src={section.image.url} alt={section.image.alt || ''} style={{ objectPosition: section.imagePosition || 'center' }} loading="lazy" /></div> : <div className="about-art" aria-hidden="true">
          <span className="about-star">{settings.template === 'restaurant' ? '◒' : settings.template === 'consultant' ? '↗' : '✳'}</span>
          <span className="about-sticker">{settings.brand}<br /><b>{section.eyebrow}</b> ↗</span>
          <span className="about-coordinate">{settings.tagline}</span>
        </div>}
        <div className="about-copy">
          <p className="eyebrow" data-forma-field="eyebrow">{section.eyebrow}</p><h2 data-forma-field="title">{section.title}</h2><p data-forma-field="description">{section.description}</p>
          <div className="stats">
             {section.stats?.map((stat, index) => <div key={index} data-forma-field={`stats.${index}`}><strong data-forma-field={`stats.${index}.value`}>{stat.value}</strong><span data-forma-field={`stats.${index}.label`}>{stat.label}</span></div>)}
          </div>
        </div>
      </div>
    </section>
  )
}
