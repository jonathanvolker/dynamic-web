import type { SectionProps } from './sections/types'
import { HeroSection } from './sections/HeroSection'
import { ServicesSection } from './sections/ServicesSection'
import { ProjectsSection } from './sections/ProjectsSection'
import { AboutSection } from './sections/AboutSection'
import { FaqSection } from './sections/FaqSection'
import { ContactSection } from './sections/ContactSection'

const renderers = {
  hero: HeroSection, services: ServicesSection, projects: ProjectsSection,
  about: AboutSection, faq: FaqSection, contact: ContactSection,
}

export function SectionRenderer(props: SectionProps) {
  const Component = renderers[props.section.blockType]
  return <Component {...props} />
}
