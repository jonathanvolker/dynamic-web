import type { FamilyId, Section, Settings } from '../../types'

export type SectionProps = { section: Section; settings: Settings; anchor: string; anchors?: string[]; buttonHref?: string; buttonInvalid?: boolean; discoveryHref?: string; siteSlug?: string; preview?: boolean; familyId?: FamilyId; demo?: boolean }
