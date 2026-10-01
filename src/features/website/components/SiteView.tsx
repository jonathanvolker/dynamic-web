import type { CSSProperties } from 'react'
import type { FamilyId, Section, Settings } from '../types'
import { Header } from './Header'
import { SectionRenderer } from './SectionRenderer'
import { foregroundFor, resolveColors } from '../theme/palettes'
import { fontFamilies } from '../theme/design'
import { resolveHref, sectionAnchors } from '../links'
import { Footer } from './Footer'

type Props = { settings: Settings; sections: Section[]; familyId?: FamilyId; demo?: boolean }

export default function SiteView({ settings, sections, familyId = 'editorial', demo = false }: Props) {
  const anchors = sectionAnchors(sections)
  const colors = resolveColors(settings)
  const theme = {
    ...(settings.design?.headingFont ? { '--heading-font': fontFamilies[settings.design.headingFont] } : {}),
    ...(settings.design?.bodyFont ? { '--body-font': fontFamilies[settings.design.bodyFont] } : {}),
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
    <div className={`website-root family-${familyId} template-${settings.template || 'studio'}`} style={theme}
      data-overlay-header={familyId === 'immersive' && sections[0]?.blockType === 'hero' && sections[0]?.heroLayout === 'cover' || undefined}
      data-heading-font={settings.design?.headingFont} data-body-font={settings.design?.bodyFont}
      data-width={settings.design?.width} data-spacing={settings.design?.spacing}>
      <a className="skip-link" href="#main">Ir al contenido</a>
      <Header settings={settings} anchors={anchors} />
      <main id="main">
        {sections.map((section, index) => {
          const defaultHref = section.blockType === 'contact' ? `mailto:${settings.email}` : '#contact'
          return <SectionRenderer key={section.id || index} section={section} settings={settings} anchor={anchors[index]}
            anchors={anchors} buttonHref={resolveHref(section.buttonHref ?? defaultHref, anchors)} discoveryHref={resolveHref(familyId === 'immersive' ? '#gallery' : familyId === 'modular' ? '#services' : '#projects', anchors)} />
        })}
      </main>
      <Footer settings={settings} familyId={familyId} anchors={anchors} demo={demo} />
    </div>
  )
}
