import { defaultSections } from './content/defaults'
import type { FamilyId, Section } from './types'

export type RowKey = 'services' | 'projects' | 'stats' | 'questions' | 'gallery' | 'testimonials' | 'plans'
export type RowField = { name: string; label: string; multiline?: boolean; link?: boolean }

export const rowLabels: Record<RowKey, string> = {
  services: 'Servicios', projects: 'Proyectos', stats: 'Datos destacados', questions: 'Preguntas',
  gallery: 'Imágenes de la galería', testimonials: 'Testimonios', plans: 'Planes y precios',
}

export const rowFields: Record<RowKey, RowField[]> = {
  services: [{ name: 'title', label: 'Nombre' }, { name: 'description', label: 'Descripción', multiline: true }, { name: 'tags', label: 'Especialidades' }],
  projects: [{ name: 'title', label: 'Nombre' }, { name: 'category', label: 'Categoría' }, { name: 'description', label: 'Detalle del proyecto', multiline: true }],
  stats: [{ name: 'value', label: 'Valor' }, { name: 'label', label: 'Descripción' }],
  questions: [{ name: 'question', label: 'Pregunta' }, { name: 'answer', label: 'Respuesta', multiline: true }],
  gallery: [{ name: 'title', label: 'Nombre' }, { name: 'description', label: 'Pie de imagen', multiline: true }],
  testimonials: [{ name: 'quote', label: 'Testimonio', multiline: true }, { name: 'name', label: 'Nombre de la persona' }, { name: 'role', label: 'Rol o contexto' }],
  plans: [
    { name: 'title', label: 'Nombre del plan' }, { name: 'price', label: 'Precio o valor' }, { name: 'period', label: 'Período o aclaración' },
    { name: 'description', label: 'Descripción', multiline: true }, { name: 'features', label: 'Incluye (una ventaja por línea)', multiline: true },
    { name: 'buttonLabel', label: 'Texto del botón' }, { name: 'buttonHref', label: 'Destino del plan', link: true },
  ],
}

type BlockDefinition = { label: string; symbol: string; rows?: RowKey; defaults: Section }
const original = (type: Section['blockType']) => defaultSections.find(section => section.blockType === type)!

/** Shared catalog for defaults, inspector lists, library and validation. */
export const blockDefinitions: Record<Section['blockType'], BlockDefinition> = {
  hero: { label: 'Portada', symbol: '◩', defaults: original('hero') },
  services: { label: 'Servicios', symbol: '▦', rows: 'services', defaults: original('services') },
  projects: { label: 'Proyectos', symbol: '▧', rows: 'projects', defaults: original('projects') },
  about: { label: 'Nosotros', symbol: '◉', rows: 'stats', defaults: original('about') },
  faq: { label: 'Preguntas', symbol: '≡', rows: 'questions', defaults: original('faq') },
  contact: { label: 'Contacto', symbol: '↗', defaults: original('contact') },
  gallery: { label: 'Galería', symbol: '▨', rows: 'gallery', defaults: {
    blockType: 'gallery', eyebrow: 'EN IMÁGENES', title: 'Una mirada más cerca.', description: 'Mostrá tus espacios, productos o momentos.',
    gallery: [{ title: 'Tu primera imagen', description: 'Agregá una foto desde el editor.' }, { title: 'Otra perspectiva', description: 'Contá qué hace especial a tu proyecto.' }],
  } },
  testimonials: { label: 'Testimonios', symbol: '❝', rows: 'testimonials', defaults: {
    blockType: 'testimonials', eyebrow: 'EXPERIENCIAS', title: 'Lo que dicen de nosotros.', description: 'Reemplazá estos ejemplos por testimonios reales, con autorización de sus autores.',
    testimonials: [{ quote: 'Escribí acá una experiencia real de tu cliente.', name: 'Nombre de ejemplo', role: 'Cliente · testimonio de muestra' }],
  } },
  pricing: { label: 'Planes y precios', symbol: '▤', rows: 'plans', defaults: {
    blockType: 'pricing', eyebrow: 'ELEGÍ TU OPCIÓN', title: 'Una propuesta para cada momento.', description: 'Presentá tus planes y conectá cada botón con tu canal de contacto.',
    plans: [{ title: 'Plan inicial', price: 'A consultar', period: 'Según tu proyecto', description: 'Una base para empezar.', features: 'Primera ventaja\nSegunda ventaja\nAcompañamiento', buttonLabel: 'Consultar', buttonHref: '#contact' }],
  } },
}

export const blockTypes = Object.keys(blockDefinitions) as Section['blockType'][]
export const blockLabels = Object.fromEntries(blockTypes.map(type => [type, blockDefinitions[type].label])) as Record<Section['blockType'], string>
export const blockSymbols = Object.fromEntries(blockTypes.map(type => [type, blockDefinitions[type].symbol])) as Record<Section['blockType'], string>

const contextualLabels: Record<FamilyId, Partial<Record<Section['blockType'], string>>> = {
  editorial: { about: 'Manifiesto', contact: 'Hablemos', projects: 'Trabajo seleccionado' },
  immersive: { services: 'Experiencias', projects: 'Recorrido', about: 'El lugar', faq: 'Antes de llegar', contact: 'Reservas' },
  modular: { services: 'Beneficios', projects: 'Casos', about: 'Resultados', faq: 'Dudas frecuentes', contact: 'Empezar' },
}

const contextualDescriptions: Record<FamilyId, Partial<Record<Section['blockType'], string>>> = {
  editorial: { about: 'La idea detrás de tu marca', projects: 'Mostrá lo que hacés mejor' },
  immersive: { services: 'Todo lo que se puede vivir', projects: 'Una secuencia visual para descubrir', about: 'La historia del espacio' },
  modular: { services: 'Razones para elegirte', projects: 'Resultados y casos concretos', pricing: 'Una propuesta clara para decidir' },
}

export function labelForBlock(type: Section['blockType'], familyId: FamilyId) {
  return contextualLabels[familyId][type] || blockLabels[type]
}

export function descriptionForBlock(type: Section['blockType'], familyId: FamilyId) {
  return contextualDescriptions[familyId][type] || `+ Agregar ${blockLabels[type].toLowerCase()}`
}

export function blockTypesForFamily(familyId: FamilyId) {
  const recommended: Record<FamilyId, Section['blockType'][]> = {
    editorial: ['hero', 'services', 'projects', 'about', 'faq', 'contact', 'gallery', 'testimonials', 'pricing'],
    immersive: ['hero', 'gallery', 'services', 'about', 'testimonials', 'contact', 'projects', 'faq', 'pricing'],
    modular: ['hero', 'services', 'testimonials', 'pricing', 'faq', 'contact', 'projects', 'about', 'gallery'],
  }
  return recommended[familyId]
}
