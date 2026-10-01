import type { FamilyId, Section, Settings } from '@/features/website/types'

export type TemplateId = NonNullable<Settings['template']>
export type TemplateDefinition = {
  id: TemplateId
  familyId: FamilyId
  name: string
  category: string
  description: string
  icon: string
  settings: Settings
  sections: Section[]
}
