import type { TemplateDefinition } from '../types'
import { productTemplate } from './product'
import { retreatTemplate } from './retreat'
import type { TemplateId } from '@/features/website/types'
import { templatePhotos } from '@/features/website/content/media'

function variant(base: TemplateDefinition, values: {
  id: TemplateId; name: string; category: string; icon: string; brand: string; email: string; accent: string
  tagline: string; seoTitle: string; seoDescription: string; hero: string; heroDescription: string
  contact: string; navigation: { label: string; href: string }[]
  about?: string; galleryTitle?: string; servicesTitle?: string; heroLayout: 'split' | 'centered' | 'cover'
  order: TemplateDefinition['sections'][number]['blockType'][]
  design: NonNullable<TemplateDefinition['settings']['design']>
}): TemplateDefinition {
  const next = structuredClone(base)
  next.id = values.id
  next.name = values.name
  next.category = values.category
  next.icon = values.icon
  next.settings.template = values.id
  next.settings.brand = values.brand
  next.settings.email = values.email
  next.settings.accent = values.accent
  next.settings.tagline = values.tagline
  next.settings.seoTitle = values.seoTitle
  next.settings.seoDescription = values.seoDescription
  next.settings.navigation = values.navigation
  next.settings.design = values.design
  const hero = next.sections.find(section => section.blockType === 'hero')!
  hero.title = values.hero
  hero.description = values.heroDescription
  hero.heroLayout = values.heroLayout
  const contact = next.sections.find(section => section.blockType === 'contact')!
  contact.title = values.contact
  const about = next.sections.find(section => section.blockType === 'about')
  if (about && values.about) about.title = values.about
  const gallery = next.sections.find(section => section.blockType === 'gallery')
  if (gallery && values.galleryTitle) gallery.title = values.galleryTitle
  const services = next.sections.find(section => section.blockType === 'services')
  if (services && values.servicesTitle) services.title = values.servicesTitle
  next.sections = values.order.map(type => next.sections.find(section => section.blockType === type)!).filter(Boolean)
  return next
}

export const coastTemplate = variant(retreatTemplate, {
  id: 'coast', name: 'Marea', category: 'Hotel & escapadas costeras', icon: '≈', brand: 'marea', email: 'reservas@marea.example', accent: '#6c9d9c',
  tagline: 'El horizonte también puede ser una forma de volver.', seoTitle: 'Marea — Días que empiezan frente al mar', seoDescription: 'Plantilla inmersiva para hoteles, posadas y experiencias junto al mar.',
  hero: 'El mar enfrente.\nEl tiempo a favor.', heroDescription: 'Una casa abierta al horizonte para descansar, descubrir y dejar que cada día encuentre su propio ritmo.', contact: 'Nos vemos\ndel otro lado.', about: 'Todo lo que necesitás\nestá cerca.', galleryTitle: 'El paisaje\ncomo anfitrión.', servicesTitle: 'Elegí cómo\nvivir el día.',
  design: { headingFont: 'serif', bodyFont: 'dm-sans', width: 'wide', spacing: 'airy' },
  heroLayout: 'split', order: ['hero', 'gallery', 'services', 'about', 'testimonials', 'contact'],
  navigation: [{ label: 'La casa', href: '#about' }, { label: 'El paisaje', href: '#gallery' }, { label: 'Experiencias', href: '#services' }],
})
coastTemplate.settings.colors = { ...retreatTemplate.settings.colors, background: '#f1f5f1', text: '#183c40', muted: '#638083', surface: '#e1ece8', border: '#c9ddda', projectPeach: '#d1e1d8', projectPurple: '#a9c9c6', projectLime: '#e2d8bd' }
coastTemplate.sections.find(section => section.blockType === 'hero')!.image = templatePhotos.lake

export const atelierTemplate = variant(retreatTemplate, {
  id: 'atelier', name: 'Línea', category: 'Arquitectura & espacios', icon: '□', brand: 'línea', email: 'estudio@linea.example', accent: '#a97154',
  tagline: 'Espacios pensados para vivir mejor.', seoTitle: 'Línea — Arquitectura que encuentra su lugar', seoDescription: 'Plantilla inmersiva para estudios de arquitectura, interiorismo y espacios con identidad.',
  hero: 'La forma de\nhabitar el mundo.', heroDescription: 'Proyectos serenos, materiales honestos y una mirada atenta a cómo cada espacio puede acompañar tu vida.', contact: 'Hablemos del\npróximo espacio.', about: 'Diseñar también es\nescuchar.', galleryTitle: 'Materia, luz\ny proporción.', servicesTitle: 'Cada proyecto\nempieza distinto.',
  design: { headingFont: 'serif', bodyFont: 'system', width: 'standard', spacing: 'standard' },
  heroLayout: 'centered', order: ['hero', 'services', 'about', 'gallery', 'testimonials', 'contact'],
  navigation: [{ label: 'El estudio', href: '#about' }, { label: 'Obras', href: '#gallery' }, { label: 'Proceso', href: '#services' }],
})
atelierTemplate.settings.colors = { ...retreatTemplate.settings.colors, background: '#f3f0ea', text: '#302b27', muted: '#7e736a', surface: '#e6e0d5', border: '#d6cfc2', projectPeach: '#d9bda7', projectPurple: '#bfc8bd', projectLime: '#ded4be' }
atelierTemplate.sections.find(section => section.blockType === 'hero')!.image = templatePhotos.house

export const launchTemplate = variant(productTemplate, {
  id: 'launch', name: 'Nimbus', category: 'SaaS & lanzamiento', icon: '✦', brand: 'nimbus', email: 'hola@nimbus.example', accent: '#ec745c',
  tagline: 'La señal que ordena lo que viene.', seoTitle: 'Nimbus — Lanzá mejor, juntos', seoDescription: 'Plantilla modular para productos SaaS, lanzamientos y herramientas digitales.',
  hero: 'Convertí la idea\nen movimiento.', heroDescription: 'Una plataforma de ejemplo para ordenar el lanzamiento, alinear equipos y llegar más lejos con menos ruido.', contact: 'Hagamos que\npase.', about: undefined, galleryTitle: undefined, servicesTitle: 'Todo lo que necesitás\npara despegar.',
  design: { headingFont: 'dm-sans', bodyFont: 'dm-sans', width: 'wide', spacing: 'compact' },
  heroLayout: 'split', order: ['hero', 'testimonials', 'services', 'pricing', 'faq', 'contact'],
  navigation: [{ label: 'Cómo funciona', href: '#services' }, { label: 'Historias', href: '#testimonials' }, { label: 'Planes', href: '#pricing' }],
})
launchTemplate.settings.colors = { ...productTemplate.settings.colors, background: '#fffaf7', text: '#2e2027', muted: '#806f78', surface: '#ffffff', border: '#eadedb', projectPeach: '#f8c7b9', projectPurple: '#d9c8f0', projectLime: '#d4eadb' }

export const scaleTemplate = variant(productTemplate, {
  id: 'scale', name: 'Escala', category: 'Consultoría & crecimiento', icon: '↗', brand: 'escala', email: 'hola@escala.example', accent: '#197c73',
  tagline: 'Decisiones claras para crecer con intención.', seoTitle: 'Escala — Crecer también se diseña', seoDescription: 'Plantilla modular para consultoría, crecimiento y servicios profesionales.',
  hero: 'Más claridad.\nMejores decisiones.', heroDescription: 'Un sistema de acompañamiento para convertir objetivos ambiciosos en un camino concreto y compartido.', contact: 'El siguiente paso\nempieza hoy.', about: undefined, galleryTitle: undefined, servicesTitle: 'Ordená el presente.\nPrepará lo que sigue.',
  design: { headingFont: 'system', bodyFont: 'system', width: 'narrow', spacing: 'standard' },
  heroLayout: 'centered', order: ['hero', 'services', 'testimonials', 'faq', 'pricing', 'contact'],
  navigation: [{ label: 'Método', href: '#services' }, { label: 'Resultados', href: '#testimonials' }, { label: 'Propuestas', href: '#pricing' }],
})
scaleTemplate.settings.colors = { ...productTemplate.settings.colors, background: '#f3faf8', text: '#153534', muted: '#5b7774', surface: '#ffffff', border: '#d2e5e0', projectPeach: '#cbe4de', projectPurple: '#d7d9f1', projectLime: '#e1ecc8' }
