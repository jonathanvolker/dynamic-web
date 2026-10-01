import type { FamilyId, Settings } from '../types'
import { resolveHref } from '../links'
import { Brand } from './Brand'

export function Footer({ settings, familyId, anchors, demo }: { settings: Settings; familyId: FamilyId; anchors: string[]; demo: boolean }) {
  const copyright = `© ${new Date().getFullYear()} ${settings.brand} · ${demo ? 'Contenido de ejemplo' : 'Todos los derechos reservados'}`
  const brand = <a className="logo" href="#main" aria-label={`${settings.brand}, inicio`}><Brand settings={settings} /></a>
  const navigation = <nav aria-label="Navegación del pie">{settings.navigation.filter(item => resolveHref(item.href, anchors)).map((item, index) => <a key={index} href={item.href}>{item.label}</a>)}</nav>
  if (familyId === 'immersive') return <footer className="immersive-footer"><div className="wrap">
    <div className="immersive-footer-top"><p>{settings.tagline}</p>{navigation}</div>
    <div className="immersive-footer-brand">{brand}<a className="footer-email" href={`mailto:${settings.email}`}>{settings.email} ↗</a></div>
    <small>{copyright}</small>
  </div></footer>
  if (familyId === 'modular') return <footer className="modular-footer wrap">
    <div className="modular-footer-grid"><div>{brand}<p>{settings.tagline}</p></div><div><strong>Explorá</strong>{navigation}</div><div><strong>Conversemos</strong><a href={`mailto:${settings.email}`}>{settings.email} ↗</a></div></div>
    <small>{copyright}</small>
  </footer>
  return <footer className="footer wrap"><div>{brand}<p>{settings.tagline}</p></div><div className="footer-right"><a href={`mailto:${settings.email}`}>{settings.email} ↗</a><span>{copyright}</span></div></footer>
}
