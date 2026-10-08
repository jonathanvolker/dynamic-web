import type { Plan, PlanId } from './types'

const price = (name: string, fallback: number) => {
  const value = Number(process.env[name])
  return Number.isFinite(value) && value >= 0 ? value : fallback
}

export const planCatalog: Record<PlanId, Plan> = {
  free: {
    id: 'free', name: 'Gratis',
    description: 'Probá Forma durante 30 días y publicá un sitio simple.',
    features: ['1 sitio', 'Portada y galería', 'Publicación durante la prueba', 'Sin dominio propio'],
    price: 0, currency: 'ARS', maxSites: 1, allowedBlocks: ['hero', 'gallery'], customDomain: false,
  },
  initial: {
    id: 'initial', name: 'Inicial',
    description: 'Todo lo necesario para presentar tu negocio y empezar a recibir consultas.',
    features: ['1 sitio', '12 tipos de sección', 'Publicaciones ilimitadas', 'URL de Forma'],
    price: price('PLAN_INITIAL_PRICE_ARS', 6000), currency: 'ARS', maxSites: 1,
    allowedBlocks: ['hero', 'services', 'projects', 'about', 'faq', 'contact', 'gallery', 'testimonials', 'cta', 'textImage', 'form', 'process'], customDomain: false,
  },
  professional: {
    id: 'professional', name: 'Profesional',
    description: 'La biblioteca completa y hasta tres sitios para llevar tu presencia online más lejos.',
    features: ['Hasta 3 sitios', 'Todas las secciones', 'Publicaciones ilimitadas', 'Dominio propio'],
    price: price('PLAN_PROFESSIONAL_PRICE_ARS', 19000), currency: 'ARS', maxSites: 3, allowedBlocks: 'all', customDomain: true,
  },
}

export function getPlan(id: string) {
  return planCatalog[id as PlanId] || planCatalog.free
}

export function minimumPlanForBlock(block: string) {
  if (planCatalog.free.allowedBlocks !== 'all' && planCatalog.free.allowedBlocks.includes(block)) return 'Gratis'
  if (planCatalog.initial.allowedBlocks !== 'all' && planCatalog.initial.allowedBlocks.includes(block)) return 'Inicial'
  return 'Profesional'
}
