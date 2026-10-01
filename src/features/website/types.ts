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
export type Action = { label: string; href: string; style?: 'primary' | 'secondary' }
export type Logo = { name: string; image?: Media; href?: string }
export type TeamMember = { name: string; role: string; bio: string; image?: Media; href?: string }
export type ProcessStep = { title: string; description: string; duration?: string }
export type MenuItem = { category: string; name: string; description: string; price: string; dietary?: string }
export type OpeningHour = { day: string; hours: string }
export type FormField = { label: string; name: string; type: 'text' | 'email' | 'tel' | 'textarea'; required?: boolean }
export type ComparisonPlan = { title: string; price: string; period: string; description: string; features: string; buttonLabel: string; buttonHref: string; featured?: boolean }
export type Section = {
  id?: string
  anchor?: string
  blockType: 'hero' | 'services' | 'projects' | 'about' | 'faq' | 'contact' | 'gallery' | 'testimonials' | 'pricing'
    | 'cta' | 'textImage' | 'video' | 'logos' | 'team' | 'stats' | 'process' | 'comparison' | 'form' | 'newsletter' | 'menu' | 'hours'
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
  actions?: Action[]
  textImageLayout?: 'image-left' | 'image-right'
  videoProvider?: 'youtube' | 'vimeo'
  videoId?: string
  videoTitle?: string
  logos?: Logo[]
  team?: TeamMember[]
  process?: ProcessStep[]
  comparison?: ComparisonPlan[]
  formFields?: FormField[]
  formSubmitLabel?: string
  formSuccessMessage?: string
  newsletterLabel?: string
  newsletterConsent?: string
  menu?: MenuItem[]
  hours?: OpeningHour[]
  address?: string
  phone?: string
  mapHref?: string
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
