import type { Section } from '@/features/website/types'

export const blockLabels: Record<Section['blockType'], string> = {
  hero: 'Portada', services: 'Servicios', projects: 'Proyectos',
  about: 'Nosotros', faq: 'Preguntas', contact: 'Contacto',
}

export const blockSymbols: Record<Section['blockType'], string> = {
  hero: '◩', services: '▦', projects: '▧', about: '◉', faq: '≡', contact: '↗',
}

export type RowKey = 'services' | 'projects' | 'stats' | 'questions'
type RowField = { name: string; label: string; multiline?: boolean }

export const rowLabels: Record<RowKey, string> = {
  services: 'Servicios', projects: 'Proyectos', stats: 'Datos destacados', questions: 'Preguntas',
}

export const rowFields: Record<RowKey, RowField[]> = {
  services: [
    { name: 'title', label: 'Nombre' },
    { name: 'description', label: 'Descripción', multiline: true },
    { name: 'tags', label: 'Especialidades' },
  ],
  projects: [
    { name: 'title', label: 'Nombre' },
    { name: 'category', label: 'Categoría' },
    { name: 'description', label: 'Detalle del proyecto', multiline: true },
  ],
  stats: [{ name: 'value', label: 'Valor' }, { name: 'label', label: 'Descripción' }],
  questions: [
    { name: 'question', label: 'Pregunta' },
    { name: 'answer', label: 'Respuesta', multiline: true },
  ],
}
