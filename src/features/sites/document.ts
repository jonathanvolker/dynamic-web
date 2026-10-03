import type { SiteDocument } from './types'
import type { Section, Settings, TemplateId } from '../website/types'
import { getTemplate } from '../templates/registry'

export const DOCUMENT_VERSION = 1

/** Read migration only: never republishes or overwrites the stored draft/snapshot. */
export function migrateDocument(input: unknown): SiteDocument {
  if (!input || typeof input !== 'object') throw new Error('Documento no válido.')
  const source = input as Partial<SiteDocument>
  if (source.schemaVersion !== undefined && source.schemaVersion !== DOCUMENT_VERSION) {
    throw new Error('Esta versión del sitio requiere una versión más reciente del editor.')
  }
  if (!source.settings || !Array.isArray(source.sections)) throw new Error('Documento incompleto.')
  const document = structuredClone(source)
  const settings = document.settings as Settings
  const templateId: TemplateId = document.templateId || settings.template || 'studio'
  const counts: Record<string, number> = {}
  const sections = (document.sections as Section[]).map((section, index) => {
    const count = (counts[section.blockType] || 0) + 1
    counts[section.blockType] = count
    return {
      ...section,
      id: section.id || `legacy-${section.blockType}-${index + 1}`,
      // Preserve the original public anchors, then keep them stable during editing.
      anchor: section.anchor || `${section.blockType}${count > 1 ? `-${count}` : ''}`,
    }
  })
  return {
    schemaVersion: DOCUMENT_VERSION,
    familyId: document.familyId || getTemplate(templateId)?.familyId || 'editorial',
    templateId,
    settings: { ...settings, template: templateId },
    sections,
  }
}

export function availableAnchor(type: Section['blockType'], sections: Section[]): string {
  const used = new Set(sections.map(section => section.anchor))
  let anchor: string = type
  let suffix = 2
  while (used.has(anchor)) anchor = `${type}-${suffix++}`
  return anchor
}
