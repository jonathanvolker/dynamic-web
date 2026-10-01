import type { SectionProps } from './types'
import { StudioArtwork } from '../artwork/StudioArtwork'
import { RestaurantArtwork } from '../artwork/RestaurantArtwork'
import { ConsultantArtwork } from '../artwork/ConsultantArtwork'
import { ProductArtwork } from '../artwork/ProductArtwork'

export function HeroSection({ section, settings, anchor, buttonHref, discoveryHref }: SectionProps) {
  const template = settings.template || 'studio'
  return (
    <section id={anchor} className={`hero wrap hero-layout-${section.heroLayout || 'split'}`}>
      <div className="hero-copy">
        <p className="eyebrow"><span className="status-dot" />{section.eyebrow}</p>
        <h1>{section.title}</h1>
        <p className="hero-description">{section.description}</p>
        {buttonHref && section.buttonLabel && <a className="button dark" href={buttonHref}>{section.buttonLabel}<span>↗</span></a>}
      </div>
      {section.image?.url
        ? <div className="hero-media"><img src={section.image.url} alt={section.image.alt || ''} style={{ objectPosition: section.imagePosition || 'center' }} fetchPriority="high" /></div>
        : template === 'product' ? <ProductArtwork settings={settings} /> : template === 'restaurant' ? <RestaurantArtwork /> : template === 'consultant' ? <ConsultantArtwork /> : <StudioArtwork />}
      <div className="hero-bottom">
        <span>{settings.tagline}</span>
        {discoveryHref && <a href={discoveryHref}>Deslizá para descubrir <span>↓</span></a>}
      </div>
    </section>
  )
}
