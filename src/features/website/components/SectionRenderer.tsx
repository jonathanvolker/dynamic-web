import type { SectionProps } from './sections/types'
import { HeroSection } from './sections/HeroSection'
import { ServicesSection } from './sections/ServicesSection'
import { ProjectsSection } from './sections/ProjectsSection'
import { AboutSection } from './sections/AboutSection'
import { FaqSection } from './sections/FaqSection'
import { ContactSection } from './sections/ContactSection'
import { GallerySection } from './sections/GallerySection'
import { TestimonialsSection } from './sections/TestimonialsSection'
import { PricingSection } from './sections/PricingSection'
import type { Section } from '../types'

const renderers = {
  hero: HeroSection, services: ServicesSection, projects: ProjectsSection,
  about: AboutSection, faq: FaqSection, contact: ContactSection,
  gallery: GallerySection, testimonials: TestimonialsSection, pricing: PricingSection,
} satisfies Record<Section['blockType'], (props: SectionProps) => React.ReactNode>

export function SectionRenderer(props: SectionProps) {
  const Component = renderers[props.section.blockType]
  return <Component {...props} />
}
