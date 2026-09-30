import type { Section, Settings } from '@/features/website/types'
export type SiteDocument = { settings: Settings; sections: Section[] }
export type Site = {
  id: string
  owner_id: string
  name: string
  slug: string
  draft: SiteDocument
  published: SiteDocument | null
  updated_at: string
  published_at: string | null
}
