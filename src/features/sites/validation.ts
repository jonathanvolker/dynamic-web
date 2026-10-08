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
  const record = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
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
  if (!Array.isArray(sections) || !sections.length || sections.filter(section => section.blockType !== 'footer').length > 30) throw new Error('El sitio necesita entre 1 y 30 secciones.')
  const keys = rowFields
  const ids = new Set<string>()
  const anchors = new Set<string>()
  for (const [index, section] of sections.entries()) {
    const isFooter = section.blockType === 'footer'
    if (!record(section) || !blockTypes.includes(section.blockType as typeof blockTypes[number]) || (!isFooter && (!text(section.title, 500) || !section.title.trim() || !text(section.eyebrow, 200) || !section.eyebrow.trim())) || (section.description !== undefined && !text(section.description)) || (section.buttonLabel !== undefined && !text(section.buttonLabel, 100))) throw new Error('Hay una sección con contenido no válido.')
    if (isFooter && index !== sections.length - 1) throw new Error('El pie de página debe ser la última sección.')
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
      if (!Array.isArray(rows) || rows.length > 20 || rows.some(row => {
        if (!record(row)) return true
        return fields.some(field => {
          const value = row[field.name]
          if (value === undefined || value === null || value === '') return !field.optional
          return typeof value !== 'string' || value.length > 5000 || (field.link && !isSafeHref(value))
        })
      })) throw new Error(key === 'plans' ? 'Revisá el destino y el destacado de los planes.' : key === 'actions' ? 'Revisá las acciones del bloque.' : key === 'logos' ? 'Revisá los logos del bloque.' : key === 'team' ? 'Revisá los datos del equipo.' : 'Revisá el contenido de las listas.')
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
    for (const action of section.actions || []) if (!text(action.label, 100) || !isSafeHref(action.href) || (action.style !== undefined && !['primary', 'secondary'].includes(action.style))) throw new Error('Revisá las acciones del bloque.')
    for (const logo of section.logos || []) if (!text(logo.name, 120) || (logo.href !== undefined && logo.href !== '' && !isSafeHref(logo.href)) || (logo.image !== undefined && !isValidMedia(logo.image))) throw new Error('Revisá los logos del bloque.')
    for (const member of section.team || []) if (!text(member.name, 120) || !text(member.role, 120) || !text(member.bio) || (member.href !== undefined && member.href !== '' && !isSafeHref(member.href)) || (member.image !== undefined && !isValidMedia(member.image))) throw new Error('Revisá los datos del equipo.')
    for (const step of section.process || []) if (!text(step.title, 120) || !text(step.description) || (step.duration !== undefined && !text(step.duration, 100))) throw new Error('Revisá los pasos del proceso.')
    for (const plan of section.comparison || []) if (!text(plan.title, 120) || !text(plan.price, 100) || !text(plan.period, 100) || !text(plan.description) || !text(plan.features) || !text(plan.buttonLabel, 100) || !isSafeHref(plan.buttonHref) || (plan.featured !== undefined && typeof plan.featured !== 'boolean')) throw new Error('Revisá la comparativa de planes.')
    const formNames = new Set<string>()
    for (const field of section.formFields || []) {
      if (!text(field.label, 120) || !field.label.trim() || !/^[a-zA-Z][\w-]{1,50}$/.test(field.name) || formNames.has(field.name) || !['text', 'email', 'tel', 'textarea'].includes(field.type) || (field.required !== undefined && typeof field.required !== 'boolean')) throw new Error('Revisá los campos del formulario.')
      formNames.add(field.name)
    }
    for (const item of section.menu || []) if (!text(item.category, 100) || !text(item.name, 120) || !text(item.description) || !text(item.price, 100) || (item.dietary !== undefined && !text(item.dietary, 200))) throw new Error('Revisá la carta gastronómica.')
    for (const item of section.hours || []) if (!text(item.day, 80) || !text(item.hours, 120)) throw new Error('Revisá los horarios.')
    if (section.videoProvider !== undefined && !['youtube', 'vimeo'].includes(section.videoProvider)) throw new Error('Proveedor de video no válido.')
    if (section.blockType === 'video' && (!section.videoProvider || !section.videoId)) throw new Error('El video necesita proveedor e identificador.')
    if (section.videoId !== undefined && !/^[a-zA-Z0-9_-]{3,120}$/.test(section.videoId)) throw new Error('ID de video no válido.')
    if (section.videoTitle !== undefined && (!text(section.videoTitle, 200) || !section.videoTitle.trim())) throw new Error('Título de video no válido.')
    if (section.textImageLayout !== undefined && !['image-left', 'image-right'].includes(section.textImageLayout)) throw new Error('Ubicación de imagen no válida.')
    for (const value of [section.formSubmitLabel, section.formSuccessMessage, section.newsletterLabel, section.newsletterConsent]) if (value !== undefined && !text(value, 500)) throw new Error('Texto de formulario no válido.')
    if (section.address !== undefined && (!text(section.address, 300) || !section.address.trim())) throw new Error('Dirección no válida.')
    if (section.phone !== undefined && (!text(section.phone, 40) || !/^\+?[\d\s().-]+$/.test(section.phone))) throw new Error('Teléfono no válido.')
    if (section.mapHref !== undefined && (!isSafeHref(section.mapHref) || !section.mapHref.startsWith('https://'))) throw new Error('El mapa debe usar un enlace HTTPS válido.')
    if (isFooter && (!text(section.footerTagline, 500) || !text(section.footerEmail, 254) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(section.footerEmail || '') || !Array.isArray(section.footerNavigation) || section.footerNavigation.length > 5 || section.footerNavigation.some(item => !text(item.label, 80) || !isSafeHref(item.href)))) throw new Error('Revisá el contenido del pie de página.')
  }
  if (JSON.stringify(input).length > 5000000) throw new Error('El sitio supera el límite de 5 MB. Reducí la cantidad de imágenes.')
}
