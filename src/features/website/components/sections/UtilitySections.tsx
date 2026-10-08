import type { SectionProps } from './types'
import { SectionHeading } from './SectionHeading'
import { resolveHref } from '../../links'

export function CtaSection({ section, anchor, anchors = [], preview }: SectionProps) {
  return <section id={anchor} className="section wrap utility-cta"><div><p className="eyebrow" data-forma-field="eyebrow">{section.eyebrow}</p><h2 data-forma-field="title">{section.title}</h2><p data-forma-field="description">{section.description}</p></div><div className="utility-actions">{section.actions?.map((action, index) => { const href = resolveHref(action.href, anchors); return href ? <a className={`button ${action.style === 'secondary' ? 'outline' : 'dark'}`} href={href} data-forma-field={`actions.${index}.label`} key={`${action.label}-${action.href}`}>{action.label}<span>↗</span></a> : preview ? <span className={`button ${action.style === 'secondary' ? 'outline' : 'dark'} editor-invalid-link`} data-forma-field={`actions.${index}.label`} key={`${action.label}-${action.href}`} title="El destino de este botón no existe">{action.label}<span>⚠ Destino no válido</span></span> : null })}</div></section>
}

export function TextImageSection({ section, anchor }: SectionProps) {
  const image = section.image?.url ? <img src={section.image.url} alt={section.image.alt || section.title} loading="lazy" /> : <div className="utility-image-placeholder" role="img" aria-label="Imagen pendiente">Agregá una imagen desde el editor</div>
  return <section id={anchor} className={`section wrap text-image text-image-${section.textImageLayout || 'image-right'}`}><div className="text-image-copy"><SectionHeading section={section} /></div><div className="text-image-media" data-forma-field="image">{image}</div></section>
}

export function VideoSection({ section, anchor }: SectionProps) {
  const src = section.videoProvider === 'vimeo' ? `https://player.vimeo.com/video/${encodeURIComponent(section.videoId || '')}` : `https://www.youtube-nocookie.com/embed/${encodeURIComponent(section.videoId || '')}`
  return <section id={anchor} className="section wrap video-block"><SectionHeading section={section} /><div className="video-frame" data-forma-field="videoId"><iframe src={src} title={section.videoTitle || section.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div></section>
}

export function LogosSection({ section, anchor, anchors = [], preview }: SectionProps) {
  return <section id={anchor} className="section wrap logos-block"><SectionHeading section={section} /><div className="logos-grid">{section.logos?.map((logo, index) => { const content = logo.image?.url ? <img data-forma-field={`logos.${index}.image`} src={logo.image.url} alt={logo.image.alt || logo.name} /> : logo.name; const href = logo.href && resolveHref(logo.href, anchors); return href ? <a href={href} key={logo.name} aria-label={logo.name} data-forma-field={`logos.${index}.name`}>{content}</a> : logo.href && preview ? <span className="editor-invalid-link" data-forma-field={`logos.${index}.name`} key={logo.name} title="El enlace de este logo no existe">{content} ⚠</span> : <span data-forma-field={`logos.${index}.name`} key={logo.name}>{content}</span> })}</div></section>
}

export function TeamSection({ section, anchor, anchors = [], preview }: SectionProps) {
  return <section id={anchor} className="section wrap team-block"><SectionHeading section={section} /><div className="team-grid">{section.team?.map((member, index) => { const href = member.href && resolveHref(member.href, anchors); return <article className="team-card" key={member.name} data-forma-field={`team.${index}`}><>{member.image?.url ? <img data-forma-field={`team.${index}.image`} src={member.image.url} alt={member.image.alt || member.name} loading="lazy" /> : <div className="team-placeholder" aria-hidden="true">{member.name.slice(0, 1)}</div>}</><h3 data-forma-field={`team.${index}.name`}>{member.name}</h3><p className="team-role" data-forma-field={`team.${index}.role`}>{member.role}</p><p data-forma-field={`team.${index}.bio`}>{member.bio}</p>{href ? <a href={href} data-forma-field={`team.${index}.href`}>Ver perfil ↗</a> : member.href && preview ? <span className="editor-invalid-link" data-forma-field={`team.${index}.href`} title="El destino de este perfil no existe">⚠ Enlace inválido</span> : null}</article> })}</div></section>
}

export function StatsSection({ section, anchor }: SectionProps) {
  return <section id={anchor} className="section wrap stats-block"><SectionHeading section={section} /><div className="stats-grid">{section.stats?.map((stat, index) => <div className="stat" key={`${stat.value}-${stat.label}`}><strong data-forma-field={`stats.${index}.value`}>{stat.value}</strong><span data-forma-field={`stats.${index}.label`}>{stat.label}</span></div>)}</div></section>
}

export function ProcessSection({ section, anchor }: SectionProps) {
  return <section id={anchor} className="section wrap process-block"><SectionHeading section={section} /><ol className="process-grid">{section.process?.map((step, index) => <li key={step.title}><span className="process-number">0{index + 1}</span><h3 data-forma-field={`process.${index}.title`}>{step.title}</h3><p data-forma-field={`process.${index}.description`}>{step.description}</p>{step.duration && <small data-forma-field={`process.${index}.duration`}>{step.duration}</small>}</li>)}</ol></section>
}

export function ComparisonSection({ section, anchor, anchors = [], preview }: SectionProps) {
  return <section id={anchor} className="section wrap comparison-block"><SectionHeading section={section} /><div className="comparison-grid">{section.comparison?.map((plan, index) => { const href = resolveHref(plan.buttonHref, anchors); return <article className={`comparison-card${plan.featured ? ' featured' : ''}`} key={plan.title}><h3 data-forma-field={`comparison.${index}.title`}>{plan.title}</h3><p className="plan-price" data-forma-field={`comparison.${index}.price`}>{plan.price}</p><p className="plan-period" data-forma-field={`comparison.${index}.period`}>{plan.period}</p><p data-forma-field={`comparison.${index}.description`}>{plan.description}</p><ul data-forma-field={`comparison.${index}.features`}>{plan.features.split('\n').filter(Boolean).map(feature => <li key={feature}>✓ {feature}</li>)}</ul>{href ? <a className="button dark" data-forma-field={`comparison.${index}.buttonLabel`} href={href}>{plan.buttonLabel}<span>↗</span></a> : preview ? <span className="button dark editor-invalid-link" data-forma-field={`comparison.${index}.buttonLabel`} title="El destino de este botón no existe">{plan.buttonLabel}<span>⚠ Destino no válido</span></span> : null}</article> })}</div></section>
}

export function MenuSection({ section, anchor }: SectionProps) {
  return <section id={anchor} className="section wrap menu-block"><SectionHeading section={section} /><div className="menu-list">{section.menu?.map((item, index) => <article className="menu-item" key={`${item.category}-${item.name}-${index}`}><div><small data-forma-field={`menu.${index}.category`}>{item.category}</small><h3 data-forma-field={`menu.${index}.name`}>{item.name}</h3><p data-forma-field={`menu.${index}.description`}>{item.description}</p>{item.dietary && <span data-forma-field={`menu.${index}.dietary`}>{item.dietary}</span>}</div><strong data-forma-field={`menu.${index}.price`}>{item.price}</strong></article>)}</div></section>
}

export function HoursSection({ section, anchor, anchors = [], preview }: SectionProps) {
  const mapHref = section.mapHref && resolveHref(section.mapHref, anchors)
  return <section id={anchor} className="section wrap hours-block"><SectionHeading section={section} /><div className="hours-layout"><div><address data-forma-field="address">{section.address}</address>{section.phone && <a data-forma-field="phone" href={`tel:${section.phone}`}>{section.phone}</a>}{mapHref ? <a className="button outline" data-forma-field="mapHref" href={mapHref}>Cómo llegar ↗</a> : preview && section.mapHref ? <span className="button outline editor-invalid-link" data-forma-field="mapHref" title="El enlace del mapa no es válido">⚠ Mapa inválido</span> : null}</div><dl>{section.hours?.map((item, index) => <div key={item.day}><dt data-forma-field={`hours.${index}.day`}>{item.day}</dt><dd data-forma-field={`hours.${index}.hours`}>{item.hours}</dd></div>)}</dl></div></section>
}
