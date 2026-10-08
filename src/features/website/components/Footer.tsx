import type { FamilyId, Section, Settings } from '../types'
import { resolveHref } from '../links'
import { Brand } from './Brand'

export function Footer({ section, settings, familyId, anchors, demo }: { section: Section; settings: Settings; familyId: FamilyId; anchors: string[]; demo: boolean }) {
  const tagline = section.footerTagline || ''
  const email = section.footerEmail || ''
  const copyright = section.footerCopyright || ''
  const brand = <a className="logo" href="#main" aria-label={`${settings.brand}, inicio`}><Brand settings={settings} /></a>
  const navigation = <nav aria-label="Navegación del pie">{(section.footerNavigation || []).map((item, index) => { const href = resolveHref(item.href, anchors); return href && <a key={index} data-forma-field={`footerNavigation.${index}`} href={href}><span data-forma-field={`footerNavigation.${index}.label`}>{item.label}</span></a> })}</nav>
  if (familyId === 'immersive') return <footer className="immersive-footer" aria-label="Pie de página"><div className="wrap">
     <div className="immersive-footer-top"><p data-forma-field="footerTagline">{tagline}</p>{navigation}</div>
    <div className="immersive-footer-brand">{brand}<a className="footer-email" data-forma-field="footerEmail" href={`mailto:${email}`}>{email} ↗</a></div>
     <small data-forma-field="footerCopyright">{copyright}</small>
  </div></footer>
  if (familyId === 'modular') return <footer className="modular-footer wrap" aria-label="Pie de página">
      <div className="modular-footer-grid"><div>{brand}<p data-forma-field="footerTagline">{tagline}</p></div><div><strong data-forma-field="footerExploreLabel">{section.footerExploreLabel}</strong>{navigation}</div><div><strong data-forma-field="footerContactLabel">{section.footerContactLabel}</strong><a data-forma-field="footerEmail" href={`mailto:${email}`}>{email} ↗</a></div></div>
     <small data-forma-field="footerCopyright">{copyright}</small>
  </footer>
  return <footer className="footer wrap" aria-label="Pie de página"><div>{brand}<p data-forma-field="footerTagline">{tagline}</p></div><div className="footer-right"><a data-forma-field="footerEmail" href={`mailto:${email}`}>{email} ↗</a><span data-forma-field="footerCopyright">{copyright}</span></div></footer>
}
