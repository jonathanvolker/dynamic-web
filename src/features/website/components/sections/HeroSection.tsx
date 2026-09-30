import type { SectionProps } from './types'
import { StudioArtwork } from '../artwork/StudioArtwork'
import { RestaurantArtwork } from '../artwork/RestaurantArtwork'
import { ConsultantArtwork } from '../artwork/ConsultantArtwork'

export function HeroSection({ section, settings, anchor }: SectionProps) {
  const template = settings.template || 'studio'
  return (
    <section id={anchor} className="hero wrap">
      <div className="hero-copy">
        <p className="eyebrow"><span className="status-dot" />{section.eyebrow}</p>
        <h1>{section.title}</h1>
        <p className="hero-description">{section.description}</p>
        <a className="button dark" href="#contact">{section.buttonLabel}<span>↗</span></a>
      </div>
      {template === 'restaurant' ? <RestaurantArtwork /> : template === 'consultant' ? <ConsultantArtwork /> : <StudioArtwork />}
      <div className="hero-bottom">
        <span>{settings.tagline}</span>
        <a href="#projects">Deslizá para descubrir <span>↓</span></a>
      </div>
    </section>
  )
}
