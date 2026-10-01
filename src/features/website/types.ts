export type Media = { url?: string; alt?: string }
export type TemplateId = 'studio' | 'restaurant' | 'consultant' | 'retreat' | 'coast' | 'atelier' | 'product' | 'launch' | 'scale'
export type FamilyId = 'editorial' | 'immersive' | 'modular'
export type FontId = 'manrope' | 'dm-sans' | 'serif' | 'system'
export type SiteDesign = {
  headingFont?: FontId
  bodyFont?: FontId
  width?: 'narrow' | 'standard' | 'wide'
  spacing?: 'compact' | 'standard' | 'airy'
}
export type Project = {
  title: string
  category: string
  description: string
  tone: 'peach' | 'purple' | 'lime'
  image?: Media
}
export type Section = {
  id?: string
  anchor?: string
  blockType: 'hero' | 'services' | 'projects' | 'about' | 'faq' | 'contact' | 'gallery' | 'testimonials' | 'pricing'
  eyebrow: string
  title: string
  description?: string
  buttonLabel?: string
  buttonHref?: string
  heroLayout?: 'split' | 'centered' | 'cover'
  image?: Media
  imagePosition?: 'center' | 'top' | 'bottom'
  services?: { title: string; description: string; tags: string }[]
  projects?: Project[]
  stats?: { value: string; label: string }[]
  questions?: { question: string; answer: string }[]
  gallery?: { title: string; description: string; image?: Media }[]
  testimonials?: { quote: string; name: string; role: string }[]
  plans?: { title: string; price: string; period: string; description: string; features: string; buttonLabel: string; buttonHref: string; featured?: boolean }[]
}
export type SiteColors = {
  background: string
  text: string
  muted: string
  surface: string
  border: string
  projectPeach: string
  projectPurple: string
  projectLime: string
}

export type Settings = {
  /** Compatibility with the original renderer; canonical identity lives on SiteDocument. */
  template?: TemplateId
  logo?: Media
  design?: SiteDesign
  headerButton?: { label: string; href: string }
  brand: string
  tagline: string
  email: string
  accent: string
  colors?: Partial<SiteColors>
  seoTitle: string
  seoDescription: string
  navigation: { label: string; href: string }[]
}
