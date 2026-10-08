import type { CSSProperties } from 'react'
import type { FamilyId, Section, Settings } from '../types'
import { Header } from './Header'
import { SectionRenderer } from './SectionRenderer'
import { foregroundFor, resolveColors } from '../theme/palettes'
import { fontFamilies } from '../theme/design'
import { resolveHref, sectionAnchors } from '../links'

type Props = { settings: Settings; sections: Section[]; familyId?: FamilyId; demo?: boolean; siteSlug?: string; preview?: boolean }

export default function SiteView({ settings, sections, familyId = 'editorial', demo = false, siteSlug, preview = false }: Props) {
  const contentSections = sections.filter(section => section.blockType !== 'footer')
  const footer = sections.find(section => section.blockType === 'footer') || {
    blockType: 'footer' as const, eyebrow: '', title: '', description: '', anchor: 'footer', id: 'footer',
    footerTagline: settings.tagline, footerEmail: settings.email, footerNavigation: settings.navigation,
    footerExploreLabel: 'Explorá', footerContactLabel: 'Conversemos', footerCopyright: `© ${new Date().getFullYear()} ${settings.brand}`,
  }
  const anchors = sectionAnchors(contentSections)
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
       data-overlay-header={familyId === 'immersive' && contentSections[0]?.blockType === 'hero' && contentSections[0]?.heroLayout === 'cover' || undefined}
      data-heading-font={settings.design?.headingFont} data-body-font={settings.design?.bodyFont}
      data-width={settings.design?.width} data-spacing={settings.design?.spacing}>
      <a className="skip-link" href="#main">Ir al contenido</a>
      <Header settings={settings} anchors={anchors} preview={preview} />
      <main id="main">
         {contentSections.map((section, index) => {
          const defaultHref = section.blockType === 'contact' ? `mailto:${settings.email}` : '#contact'
          const rawButtonHref = section.buttonHref ?? defaultHref
          const buttonHref = resolveHref(rawButtonHref, anchors)
           return <SectionRenderer key={section.id || index} section={section} settings={settings} anchor={anchors[index]}
             anchors={anchors} siteSlug={siteSlug} preview={preview} familyId={familyId} demo={demo} buttonHref={buttonHref} buttonInvalid={Boolean(rawButtonHref && !buttonHref)} discoveryHref={resolveHref(familyId === 'immersive' ? '#gallery' : familyId === 'modular' ? '#services' : '#projects', anchors)} />
         })}
       </main>
       <SectionRenderer section={footer} settings={settings} anchor="footer" anchors={anchors} familyId={familyId} demo={demo} preview={preview} />
    </div>
  )
}
