export type Media = { url?: string; alt?: string }
export type Project = {
  title: string
  category: string
  description: string
  tone: 'peach' | 'purple' | 'lime'
  image?: Media
}
export type Section = {
  id?: string
  blockType: 'hero' | 'services' | 'projects' | 'about' | 'faq' | 'contact'
  eyebrow: string
  title: string
  description?: string
  buttonLabel?: string
  services?: { title: string; description: string; tags: string }[]
  projects?: Project[]
  stats?: { value: string; label: string }[]
  questions?: { question: string; answer: string }[]
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
  template?: 'studio' | 'restaurant' | 'consultant'
  brand: string
  tagline: string
  email: string
  accent: string
  colors?: Partial<SiteColors>
  seoTitle: string
  seoDescription: string
  navigation: { label: string; href: string }[]
}
