import { defaultSettings, defaultSections } from '@/features/website/content/defaults'
import { restaurantTemplate } from './content/restaurant'
import { consultantTemplate } from './content/consultant'
import type { TemplateDefinition } from './types'

export const templates: TemplateDefinition[] = [
  {
    id: 'studio', name: 'Forma', category: 'Estudio creativo & portfolio', icon: '✳',
    description: 'Tipografía grande, acentos lima y proyectos visuales para una marca con personalidad.',
    settings: { ...defaultSettings, template: 'studio' }, sections: defaultSections,
  },
  restaurantTemplate,
  consultantTemplate,
]

export function getTemplate(id: string) {
  return templates.find(template => template.id === id)
}
