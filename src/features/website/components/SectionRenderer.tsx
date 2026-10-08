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
import { CtaSection, TextImageSection, VideoSection, LogosSection, TeamSection, StatsSection, ProcessSection, ComparisonSection, MenuSection, HoursSection } from './sections/UtilitySections'
import { LeadFormSection, NewsletterSection } from './sections/LeadSections'

const renderers = {
  hero: HeroSection, services: ServicesSection, projects: ProjectsSection,
  about: AboutSection, faq: FaqSection, contact: ContactSection,
  gallery: GallerySection, testimonials: TestimonialsSection, pricing: PricingSection,
  cta: CtaSection, textImage: TextImageSection, video: VideoSection, logos: LogosSection,
  team: TeamSection, stats: StatsSection, process: ProcessSection, comparison: ComparisonSection,
  form: LeadFormSection, newsletter: NewsletterSection, menu: MenuSection, hours: HoursSection,
} satisfies Record<Section['blockType'], (props: SectionProps) => React.ReactNode>

export function SectionRenderer(props: SectionProps) {
  const Component = renderers[props.section.blockType]
  if (!Component) return <section id={props.anchor} className="section editor-invalid-block">Este bloque no se puede mostrar. Volvé a seleccionarlo desde el editor.</section>
  return <Component {...props} />
}
