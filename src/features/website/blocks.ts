import { defaultSections } from './content/defaults'
import type { FamilyId, Section } from './types'

export type RowKey = 'services' | 'projects' | 'stats' | 'questions' | 'gallery' | 'testimonials' | 'plans' | 'actions' | 'logos' | 'team' | 'process' | 'comparison' | 'formFields' | 'menu' | 'hours'
export type RowField = { name: string; label: string; multiline?: boolean; link?: boolean; optional?: boolean }

export const rowLabels: Record<RowKey, string> = {
  services: 'Servicios', projects: 'Proyectos', stats: 'Datos destacados', questions: 'Preguntas',
  gallery: 'Imágenes de la galería', testimonials: 'Testimonios', plans: 'Planes y precios',
  actions: 'Acciones', logos: 'Logos', team: 'Personas del equipo', process: 'Pasos del proceso',
  comparison: 'Planes comparables', formFields: 'Campos del formulario', menu: 'Platos y bebidas', hours: 'Horarios',
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
  actions: [{ name: 'label', label: 'Texto del botón' }, { name: 'href', label: 'Destino', link: true }],
  logos: [{ name: 'name', label: 'Nombre' }, { name: 'href', label: 'Enlace opcional', link: true, optional: true }],
  team: [{ name: 'name', label: 'Nombre' }, { name: 'role', label: 'Rol' }, { name: 'bio', label: 'Biografía', multiline: true }, { name: 'href', label: 'Perfil opcional', link: true, optional: true }],
  process: [{ name: 'title', label: 'Paso' }, { name: 'description', label: 'Descripción', multiline: true }, { name: 'duration', label: 'Duración opcional', optional: true }],
  comparison: [{ name: 'title', label: 'Plan' }, { name: 'price', label: 'Precio' }, { name: 'period', label: 'Período' }, { name: 'description', label: 'Descripción', multiline: true }, { name: 'features', label: 'Características', multiline: true }, { name: 'buttonLabel', label: 'Texto del botón' }, { name: 'buttonHref', label: 'Destino', link: true }],
  formFields: [{ name: 'label', label: 'Etiqueta' }, { name: 'name', label: 'Nombre técnico' }, { name: 'type', label: 'Tipo: text, email, tel o textarea' }],
  menu: [{ name: 'category', label: 'Categoría' }, { name: 'name', label: 'Nombre' }, { name: 'description', label: 'Descripción', multiline: true }, { name: 'price', label: 'Precio' }, { name: 'dietary', label: 'Información dietaria', optional: true }],
  hours: [{ name: 'day', label: 'Día' }, { name: 'hours', label: 'Horario' }],
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
  cta: { label: 'CTA destacado', symbol: '→', rows: 'actions', defaults: {
    blockType: 'cta', eyebrow: 'SIGUIENTE PASO', title: 'Hagamos algo valioso juntos.', description: 'Contanos qué querés lograr y te respondemos con una propuesta clara.', actions: [{ label: 'Hablemos', href: '#contact', style: 'primary' }],
  } },
  textImage: { label: 'Texto + imagen', symbol: '◫', defaults: {
    blockType: 'textImage', eyebrow: 'UNA MIRADA DISTINTA', title: 'La historia también está en los detalles.', description: 'Combiná una idea concreta con una imagen que ayude a entender, confiar o decidir.', textImageLayout: 'image-right',
  } },
  video: { label: 'Video o embed', symbol: '▶', defaults: {
    blockType: 'video', eyebrow: 'EN ACCIÓN', title: 'Mirá cómo funciona.', description: 'Mostrá una demostración breve y accesible de tu producto o servicio.', videoProvider: 'youtube', videoId: 'dQw4w9WgXcQ', videoTitle: 'Video de demostración',
  } },
  logos: { label: 'Logos de clientes', symbol: '◎', rows: 'logos', defaults: {
    blockType: 'logos', eyebrow: 'CONFIANZA', title: 'Elegido por equipos que piensan en grande.', description: 'Agregá marcas con permiso para mostrar su relación contigo.', logos: [{ name: 'Cliente destacado' }, { name: 'Otra organización' }, { name: 'Comunidad aliada' }],
  } },
  team: { label: 'Equipo', symbol: '◌', rows: 'team', defaults: {
    blockType: 'team', eyebrow: 'EL EQUIPO', title: 'Personas detrás de cada decisión.', description: 'Presentá a quienes hacen posible la experiencia.', team: [{ name: 'Nombre del equipo', role: 'Dirección', bio: 'Una breve presentación de su experiencia y mirada.' }],
  } },
  stats: { label: 'Estadísticas', symbol: '#', rows: 'stats', defaults: {
    blockType: 'stats', eyebrow: 'EN NÚMEROS', title: 'Resultados que se pueden contar.', description: 'Usá datos concretos y contexto para que cada cifra sea creíble.', stats: [{ value: '10+', label: 'Años de experiencia' }, { value: '94%', label: 'Clientes que vuelven' }, { value: '24h', label: 'Tiempo de respuesta' }],
  } },
  process: { label: 'Proceso', symbol: '1→', rows: 'process', defaults: {
    blockType: 'process', eyebrow: 'CÓMO TRABAJAMOS', title: 'Un proceso claro, de principio a fin.', description: 'Mostrá qué ocurre después de que una persona decide contactarte.', process: [{ title: 'Descubrimos', description: 'Entendemos el contexto, el objetivo y las restricciones.' }, { title: 'Construimos', description: 'Convertimos esa información en una solución concreta.' }, { title: 'Acompañamos', description: 'Medimos, aprendemos y mejoramos juntos.' }],
  } },
  comparison: { label: 'Comparativa de planes', symbol: '▥', rows: 'comparison', defaults: {
    blockType: 'comparison', eyebrow: 'COMPARÁ', title: 'Elegí la opción que te conviene.', description: 'Hacé visibles las diferencias importantes y facilitá una decisión informada.', comparison: [{ title: 'Esencial', price: 'US$ 49', period: 'por mes', description: 'Para empezar con foco.', features: 'Soporte por email\n3 proyectos\nMétricas básicas', buttonLabel: 'Elegir plan', buttonHref: '#contact' }, { title: 'Pro', price: 'US$ 99', period: 'por mes', description: 'Para equipos en crecimiento.', features: 'Soporte prioritario\nProyectos ilimitados\nMétricas avanzadas', buttonLabel: 'Elegir plan', buttonHref: '#contact', featured: true }],
  } },
  form: { label: 'Formulario de contacto', symbol: '✎', rows: 'formFields', defaults: {
    blockType: 'form', eyebrow: 'CONTACTO', title: 'Contanos qué necesitás.', description: 'Respondemos personalmente y usamos tus datos solo para atender tu consulta.', formFields: [{ label: 'Nombre', name: 'name', type: 'text', required: true }, { label: 'Email', name: 'email', type: 'email', required: true }, { label: 'Mensaje', name: 'message', type: 'textarea', required: true }], formSubmitLabel: 'Enviar consulta', formSuccessMessage: 'Recibimos tu consulta. Te responderemos pronto.',
  } },
  newsletter: { label: 'Newsletter', symbol: '✉', defaults: {
    blockType: 'newsletter', eyebrow: 'NOVEDADES', title: 'Ideas útiles, sin ruido.', description: 'Recibí novedades y recursos directamente en tu email.', newsletterLabel: 'Tu email', newsletterConsent: 'Acepto recibir novedades y puedo cancelar cuando quiera.', formSubmitLabel: 'Suscribirme', formSuccessMessage: 'Listo. Revisá tu email para confirmar la suscripción.',
  } },
  menu: { label: 'Carta gastronómica', symbol: '≋', rows: 'menu', defaults: {
    blockType: 'menu', eyebrow: 'EN LA MESA', title: 'Una carta para volver.', description: 'Presentá tus platos con información clara de ingredientes, precio y opciones.', menu: [{ category: 'Para empezar', name: 'Plato de temporada', description: 'Ingredientes frescos y una preparación de la casa.', price: '$ 12.000', dietary: 'Vegetariano' }, { category: 'Principales', name: 'Especial de la casa', description: 'Consultá disponibilidad al reservar.', price: '$ 18.000', dietary: '' }],
  } },
  hours: { label: 'Horarios y ubicación', symbol: '⌖', rows: 'hours', defaults: {
    blockType: 'hours', eyebrow: 'VISITANOS', title: 'Estamos cerca.', description: 'Encontrá horarios, dirección y la forma más simple de llegar.', address: 'Av. Siempre Viva 123, Buenos Aires', phone: '+5491100000000', mapHref: 'https://maps.google.com', hours: [{ day: 'Lunes a viernes', hours: '9:00 a 18:00' }, { day: 'Sábado', hours: '10:00 a 14:00' }, { day: 'Domingo', hours: 'Cerrado' }],
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
    editorial: ['hero', 'textImage', 'services', 'projects', 'about', 'stats', 'team', 'process', 'faq', 'cta', 'form', 'contact', 'gallery', 'testimonials', 'logos', 'newsletter', 'menu', 'hours', 'video', 'comparison', 'pricing'],
    immersive: ['hero', 'gallery', 'textImage', 'video', 'services', 'about', 'testimonials', 'logos', 'process', 'contact', 'form', 'hours', 'projects', 'faq', 'cta', 'newsletter', 'team', 'stats', 'menu', 'comparison', 'pricing'],
    modular: ['hero', 'textImage', 'video', 'services', 'stats', 'process', 'testimonials', 'logos', 'comparison', 'pricing', 'cta', 'form', 'newsletter', 'faq', 'contact', 'projects', 'about', 'gallery', 'team', 'menu', 'hours'],
  }
  return recommended[familyId]
}
