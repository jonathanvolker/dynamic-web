import type { CSSProperties } from 'react'
import type { Section, Settings } from '../types'
import { Header } from './Header'
import { SectionRenderer } from './SectionRenderer'
import { foregroundFor, resolveColors } from '../theme/palettes'

type Props = { settings: Settings; sections: Section[]; demo?: boolean }

export default function SiteView({ settings, sections, demo = false }: Props) {
  const occurrences: Record<string, number> = {}
  const colors = resolveColors(settings)
  const theme = {
    '--accent': settings.accent,
    '--on-accent': foregroundFor(settings.accent),
    '--paper': colors.background,
    '--ink': colors.text,
    '--site-text': colors.text,
    '--muted': colors.muted,
    '--surface': colors.surface,
    '--line': colors.border,
    '--project-peach': colors.projectPeach,
    '--project-purple': colors.projectPurple,
    '--project-lime': colors.projectLime,
    '--on-peach': foregroundFor(colors.projectPeach),
    '--on-purple': foregroundFor(colors.projectPurple),
    '--on-lime': foregroundFor(colors.projectLime),
  } as CSSProperties

  return (
    <div className={`website-root template-${settings.template || 'studio'}`} style={theme}>
      <a className="skip-link" href="#main">Ir al contenido</a>
      <Header settings={settings} />
      <main id="main">
        {sections.map((section, index) => {
          const count = occurrences[section.blockType] || 0
          occurrences[section.blockType] = count + 1
          const anchor = `${section.blockType}${count ? `-${count + 1}` : ''}`
          return <SectionRenderer key={section.id || index} section={section} settings={settings} anchor={anchor} />
        })}
      </main>
      <footer className="footer wrap">
        <div>
          <a className="logo" href="#main">{settings.brand}<span className="logo-dot">✳</span></a>
          <p>{settings.tagline}</p>
        </div>
        <div className="footer-right">
          <a href={`mailto:${settings.email}`}>{settings.email} ↗</a>
          <span>© {new Date().getFullYear()} {settings.brand} · {demo ? 'Propuesta visual · contenido de ejemplo' : 'Todos los derechos reservados'}</span>
        </div>
      </footer>
    </div>
  )
}
