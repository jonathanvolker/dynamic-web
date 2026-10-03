import type { Plan, PlanId } from './types'

const price = (name: string, fallback: number) => {
  const value = Number(process.env[name])
  return Number.isFinite(value) && value >= 0 ? value : fallback
}

export const planCatalog: Record<PlanId, Plan> = {
  free: {
    id: 'free', name: 'Gratis',
    description: 'Probá Forma durante 30 días con una selección esencial de bloques.',
    features: ['1 sitio', 'Hero y galería', 'Publicaciones ilimitadas durante el trial', 'Sin dominio personalizado'],
    price: 0, currency: 'ARS', maxSites: 1, allowedBlocks: ['hero', 'gallery'], customDomain: false,
  },
  initial: {
    id: 'initial', name: 'Inicial',
    description: 'Construí un sitio comercial completo con los bloques esenciales para empezar a vender.',
    features: ['1 sitio', '12 bloques disponibles', 'Publicaciones ilimitadas', 'Sin dominio personalizado'],
    price: price('PLAN_INITIAL_PRICE_ARS', 6000), currency: 'ARS', maxSites: 1,
    allowedBlocks: ['hero', 'services', 'projects', 'about', 'faq', 'contact', 'gallery', 'testimonials', 'cta', 'textImage', 'form', 'process'], customDomain: false,
  },
  professional: {
    id: 'professional', name: 'Profesional',
    description: 'Accedé a toda la biblioteca, varios sitios y un dominio propio para crecer sin límites.',
    features: ['Hasta 3 sitios', 'Los 21 bloques', 'Publicaciones ilimitadas', 'Dominio personalizado'],
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
