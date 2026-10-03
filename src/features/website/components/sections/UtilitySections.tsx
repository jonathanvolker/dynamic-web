import type { SectionProps } from './types'
import { SectionHeading } from './SectionHeading'
import { resolveHref } from '../../links'

export function CtaSection({ section, anchor, anchors = [] }: SectionProps) {
  return <section id={anchor} className="section wrap utility-cta"><div><p className="eyebrow">{section.eyebrow}</p><h2>{section.title}</h2><p>{section.description}</p></div><div className="utility-actions">{section.actions?.map(action => { const href = resolveHref(action.href, anchors); return href && <a className={`button ${action.style === 'secondary' ? 'outline' : 'dark'}`} href={href} key={`${action.label}-${action.href}`}>{action.label}<span>↗</span></a> })}</div></section>
}

export function TextImageSection({ section, anchor }: SectionProps) {
  const image = section.image?.url ? <img src={section.image.url} alt={section.image.alt || section.title} loading="lazy" /> : <div className="utility-image-placeholder" role="img" aria-label="Imagen pendiente">Agregá una imagen desde el editor</div>
  return <section id={anchor} className={`section wrap text-image text-image-${section.textImageLayout || 'image-right'}`}><div className="text-image-copy"><SectionHeading section={section} /></div><div className="text-image-media">{image}</div></section>
}

export function VideoSection({ section, anchor }: SectionProps) {
  const src = section.videoProvider === 'vimeo' ? `https://player.vimeo.com/video/${encodeURIComponent(section.videoId || '')}` : `https://www.youtube-nocookie.com/embed/${encodeURIComponent(section.videoId || '')}`
  return <section id={anchor} className="section wrap video-block"><SectionHeading section={section} /><div className="video-frame"><iframe src={src} title={section.videoTitle || section.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div></section>
}

export function LogosSection({ section, anchor, anchors = [] }: SectionProps) {
  return <section id={anchor} className="section wrap logos-block"><SectionHeading section={section} /><div className="logos-grid">{section.logos?.map(logo => { const content = logo.image?.url ? <img src={logo.image.url} alt={logo.image.alt || logo.name} /> : logo.name; const href = logo.href && resolveHref(logo.href, anchors); return href ? <a href={href} key={logo.name} aria-label={logo.name}>{content}</a> : <span key={logo.name}>{content}</span> })}</div></section>
}

export function TeamSection({ section, anchor, anchors = [] }: SectionProps) {
  return <section id={anchor} className="section wrap team-block"><SectionHeading section={section} /><div className="team-grid">{section.team?.map(member => { const href = member.href && resolveHref(member.href, anchors); return <article className="team-card" key={member.name}>{member.image?.url ? <img src={member.image.url} alt={member.image.alt || member.name} loading="lazy" /> : <div className="team-placeholder" aria-hidden="true">{member.name.slice(0, 1)}</div>}<h3>{member.name}</h3><p className="team-role">{member.role}</p><p>{member.bio}</p>{href && <a href={href}>Ver perfil ↗</a>}</article> })}</div></section>
}

export function StatsSection({ section, anchor }: SectionProps) {
  return <section id={anchor} className="section wrap stats-block"><SectionHeading section={section} /><div className="stats-grid">{section.stats?.map(stat => <div className="stat" key={`${stat.value}-${stat.label}`}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div></section>
}

export function ProcessSection({ section, anchor }: SectionProps) {
  return <section id={anchor} className="section wrap process-block"><SectionHeading section={section} /><ol className="process-grid">{section.process?.map((step, index) => <li key={step.title}><span className="process-number">0{index + 1}</span><h3>{step.title}</h3><p>{step.description}</p>{step.duration && <small>{step.duration}</small>}</li>)}</ol></section>
}

export function ComparisonSection({ section, anchor, anchors = [] }: SectionProps) {
  return <section id={anchor} className="section wrap comparison-block"><SectionHeading section={section} /><div className="comparison-grid">{section.comparison?.map(plan => { const href = resolveHref(plan.buttonHref, anchors); return <article className={`comparison-card${plan.featured ? ' featured' : ''}`} key={plan.title}><h3>{plan.title}</h3><p className="plan-price">{plan.price}</p><p className="plan-period">{plan.period}</p><p>{plan.description}</p><ul>{plan.features.split('\n').filter(Boolean).map(feature => <li key={feature}>✓ {feature}</li>)}</ul>{href && <a className="button dark" href={href}>{plan.buttonLabel}<span>↗</span></a>}</article> })}</div></section>
}

export function MenuSection({ section, anchor }: SectionProps) {
  return <section id={anchor} className="section wrap menu-block"><SectionHeading section={section} /><div className="menu-list">{section.menu?.map((item, index) => <article className="menu-item" key={`${item.category}-${item.name}-${index}`}><div><small>{item.category}</small><h3>{item.name}</h3><p>{item.description}</p>{item.dietary && <span>{item.dietary}</span>}</div><strong>{item.price}</strong></article>)}</div></section>
}

export function HoursSection({ section, anchor, anchors = [] }: SectionProps) {
  const mapHref = section.mapHref && resolveHref(section.mapHref, anchors)
  return <section id={anchor} className="section wrap hours-block"><SectionHeading section={section} /><div className="hours-layout"><div><address>{section.address}</address>{section.phone && <a href={`tel:${section.phone}`}>{section.phone}</a>}{mapHref && <a className="button outline" href={mapHref}>Cómo llegar ↗</a>}</div><dl>{section.hours?.map(item => <div key={item.day}><dt>{item.day}</dt><dd>{item.hours}</dd></div>)}</dl></div></section>
}
