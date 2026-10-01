import type { SiteDocument } from './types'
import { defaultColors } from '@/features/website/theme/palettes'
import { getTemplate } from '@/features/templates/registry'
import { isSafeHref } from '@/features/website/links'
import { isValidMedia } from '@/features/website/media'
import { blockTypes, rowFields } from '@/features/website/blocks'

export function validateSite(input: unknown): asserts input is SiteDocument {
  if (!input || typeof input !== 'object') throw new Error('El sitio no es válido.')
  const { settings, sections, schemaVersion, familyId, templateId } = input as SiteDocument
  if (schemaVersion !== 1 || !getTemplate(templateId) || getTemplate(templateId)?.familyId !== familyId || settings?.template !== templateId) throw new Error('La versión o familia del sitio no es válida. Recargá el editor.')
  const text = (value: unknown, max = 5000) => typeof value === 'string' && value.length <= max
  if (!settings || !text(settings.brand, 80) || !settings.brand.trim() || !text(settings.email, 254) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email) || !/^#[a-f0-9]{6}$/i.test(settings.accent) || !text(settings.tagline) || !text(settings.seoTitle, 160) || !text(settings.seoDescription, 500)) throw new Error('Revisá la marca, email, color y datos SEO.')
  if (settings.template !== undefined && !getTemplate(settings.template)) throw new Error('Plantilla no válida.')
  if (settings.logo !== undefined && !isValidMedia(settings.logo)) throw new Error('El logo no es válido.')
  if (settings.headerButton !== undefined && (!settings.headerButton || !text(settings.headerButton.label, 100) || !isSafeHref(settings.headerButton.href))) throw new Error('Revisá el botón del menú.')
  if (settings.design !== undefined) {
    if (!settings.design || typeof settings.design !== 'object' || Array.isArray(settings.design)) throw new Error('El diseño no es válido.')
    const choices: Record<string, string[]> = {
      headingFont: ['manrope', 'dm-sans', 'serif', 'system'], bodyFont: ['manrope', 'dm-sans', 'serif', 'system'],
      width: ['narrow', 'standard', 'wide'], spacing: ['compact', 'standard', 'airy'],
    }
    if (Object.entries(settings.design).some(([key, value]) => !choices[key]?.includes(value))) throw new Error('Revisá tipografía, ancho y espaciado.')
  }
  if (settings.colors !== undefined) {
    if (!settings.colors || typeof settings.colors !== 'object' || Array.isArray(settings.colors)
      || Object.entries(settings.colors).some(([key, value]) => !(key in defaultColors)
        || typeof value !== 'string' || !/^#[a-f0-9]{6}$/i.test(value))) {
      throw new Error('Los colores deben usar el formato #RRGGBB.')
    }
  }
  if (!Array.isArray(settings.navigation) || settings.navigation.length > 5 || settings.navigation.some(item => !item || !text(item.label, 80) || !isSafeHref(item.href))) throw new Error('Revisá los destinos del menú: sección, ruta, https://, mailto: o tel:.')
  if (!Array.isArray(sections) || !sections.length || sections.length > 30) throw new Error('El sitio necesita entre 1 y 30 secciones.')
  const keys = Object.fromEntries(Object.entries(rowFields).map(([key, fields]) => [key, fields.map(field => field.name)]))
  const ids = new Set<string>()
  const anchors = new Set<string>()
  for (const section of sections) {
    if (!section || !blockTypes.includes(section.blockType) || !text(section.title, 500) || !text(section.eyebrow, 200) || (section.description !== undefined && !text(section.description)) || (section.buttonLabel !== undefined && !text(section.buttonLabel, 100))) throw new Error('Hay una sección con contenido no válido.')
    if (!text(section.id, 100) || !section.id || ids.has(section.id)
      || !text(section.anchor, 100) || !section.anchor || !/^[a-zA-Z][\w-]*$/.test(section.anchor)
      || ['main', 'navigation'].includes(section.anchor) || anchors.has(section.anchor)) throw new Error('Las secciones necesitan identificadores únicos.')
    ids.add(section.id); anchors.add(section.anchor)
    if (section.buttonHref !== undefined && !isSafeHref(section.buttonHref)) throw new Error('Revisá el destino del botón.')
    if (section.heroLayout !== undefined && !['split', 'centered', 'cover'].includes(section.heroLayout)) throw new Error('Composición de portada no válida.')
    if (section.imagePosition !== undefined && !['center', 'top', 'bottom'].includes(section.imagePosition)) throw new Error('Posición de imagen no válida.')
    if (section.image !== undefined && !isValidMedia(section.image)) throw new Error('Imagen de sección no válida.')
    for (const [key, fields] of Object.entries(keys)) {
      const rows = (section as unknown as Record<string, unknown>)[key]
      if (rows === undefined) continue
      if (!Array.isArray(rows) || rows.length > 20 || rows.some(row => !row || fields.some(field => !text(row[field])))) throw new Error('Revisá el contenido de las listas.')
    }
    for (const project of section.projects || []) {
      if (!['peach', 'purple', 'lime'].includes(project.tone)) throw new Error('Estilo de proyecto no válido.')
      if (project.image && !isValidMedia(project.image)) throw new Error('La imagen no es válida. Volvé a cargarla desde el editor.')
    }
    for (const item of section.gallery || []) {
      if (item.image !== undefined && !isValidMedia(item.image)) throw new Error('Imagen de galería no válida.')
    }
    for (const plan of section.plans || []) {
      if (!isSafeHref(plan.buttonHref) || (plan.featured !== undefined && typeof plan.featured !== 'boolean')) throw new Error('Revisá el destino y el destacado de los planes.')
    }
  }
  if (JSON.stringify(input).length > 5000000) throw new Error('El sitio supera el límite de 5 MB. Reducí la cantidad de imágenes.')
}
