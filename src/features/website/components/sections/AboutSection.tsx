import type { SectionProps } from './types'

export function AboutSection({ section, settings, anchor }: SectionProps) {
  return (
    <section id={anchor} className="about">
      <div className="wrap about-grid">
        <div className="about-art" aria-hidden="true">
          <span className="about-star">{settings.template === 'restaurant' ? '◒' : settings.template === 'consultant' ? '↗' : '✳'}</span>
          <span className="about-sticker">{settings.brand}<br /><b>{section.eyebrow}</b> ↗</span>
          <span className="about-coordinate">{settings.tagline}</span>
        </div>
        <div className="about-copy">
          <p className="eyebrow">{section.eyebrow}</p><h2>{section.title}</h2><p>{section.description}</p>
          <div className="stats">
            {section.stats?.map((stat, index) => <div key={index}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}
          </div>
        </div>
      </div>
    </section>
  )
}
