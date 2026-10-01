import type { FamilyId, Section, Settings, TemplateId } from '@/features/website/types'
export type SiteDocument = {
  schemaVersion: 1
  familyId: FamilyId
  templateId: TemplateId
  settings: Settings
  sections: Section[]
}
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
