import type { SiteDocument } from './types'
import { defaultColors } from '@/features/website/theme/palettes'
import { getTemplate } from '@/features/templates/registry'

export function validateSite(input: unknown): asserts input is SiteDocument {
  if (!input || typeof input !== 'object') throw new Error('El sitio no es válido.')
  const { settings, sections } = input as SiteDocument
  const text = (value: unknown, max = 5000) => typeof value === 'string' && value.length <= max
  if (!settings || !text(settings.brand, 80) || !settings.brand.trim() || !text(settings.email, 254) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email) || !/^#[a-f0-9]{6}$/i.test(settings.accent) || !text(settings.tagline) || !text(settings.seoTitle, 160) || !text(settings.seoDescription, 500)) throw new Error('Revisá la marca, email, color y datos SEO.')
  if (settings.template !== undefined && !getTemplate(settings.template)) throw new Error('Plantilla no válida.')
  if (settings.colors !== undefined) {
    if (!settings.colors || typeof settings.colors !== 'object' || Array.isArray(settings.colors)
      || Object.entries(settings.colors).some(([key, value]) => !(key in defaultColors)
        || typeof value !== 'string' || !/^#[a-f0-9]{6}$/i.test(value))) {
      throw new Error('Los colores deben usar el formato #RRGGBB.')
    }
  }
  if (!Array.isArray(settings.navigation) || settings.navigation.length > 5 || settings.navigation.some(item => !text(item.label, 80) || !text(item.href, 500) || !/^(#[\w-]+|\/(?!\/)|https:\/\/)/.test(item.href))) throw new Error('Los enlaces del menú deben usar #seccion, /ruta o https://.')
  if (!Array.isArray(sections) || !sections.length || sections.length > 30) throw new Error('El sitio necesita entre 1 y 30 secciones.')
  const keys: Record<string, string[]> = { services: ['title', 'description', 'tags'], projects: ['title', 'description', 'category'], stats: ['value', 'label'], questions: ['question', 'answer'] }
  for (const section of sections) {
    if (!section || !['hero', 'services', 'projects', 'about', 'faq', 'contact'].includes(section.blockType) || !text(section.title, 500) || !text(section.eyebrow, 200) || (section.description !== undefined && !text(section.description)) || (section.buttonLabel !== undefined && !text(section.buttonLabel, 100))) throw new Error('Hay una sección con contenido no válido.')
    for (const [key, fields] of Object.entries(keys)) {
      const rows = (section as unknown as Record<string, unknown>)[key]
      if (rows === undefined) continue
      if (!Array.isArray(rows) || rows.length > 20 || rows.some(row => !row || fields.some(field => !text(row[field])))) throw new Error('Revisá el contenido de las listas.')
    }
    for (const project of section.projects || []) {
      if (!['peach', 'purple', 'lime'].includes(project.tone)) throw new Error('Estilo de proyecto no válido.')
      if (project.image && (!text(project.image.alt, 500) || !text(project.image.url, 2000000) || !/^data:image\/(jpeg|png|webp);base64,[a-z0-9+/=]+$/i.test(project.image.url || ''))) throw new Error('La imagen no es válida. Volvé a cargarla desde el editor.')
    }
  }
  if (JSON.stringify(input).length > 5000000) throw new Error('El sitio supera el límite de 5 MB. Reducí la cantidad de imágenes.')
}
