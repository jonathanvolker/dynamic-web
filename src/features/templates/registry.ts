import { defaultSettings, defaultSections } from '@/features/website/content/defaults'
import { restaurantTemplate } from './content/restaurant'
import { consultantTemplate } from './content/consultant'
import { retreatTemplate } from './content/retreat'
import { productTemplate } from './content/product'
import { atelierTemplate, coastTemplate, launchTemplate, scaleTemplate } from './content/variants'
import type { TemplateDefinition } from './types'

export const families = [{
  id: 'editorial' as const,
  name: 'Editorial creativo',
  description: 'Composiciones editoriales, titulares grandes y acentos gráficos. Tres puntos de partida de una misma familia visual.',
}, {
  id: 'immersive' as const,
  name: 'Inmersivo fotográfico',
  description: 'Imágenes a todo lo ancho, navegación sobre el paisaje y un recorrido pausado. El espacio y la fotografía cuentan la historia.',
}, {
  id: 'modular' as const,
  name: 'Modular producto',
  description: 'Portadas centradas, demostración de producto y bloques compactos de beneficios, testimonios y planes. Una estructura enfocada en decidir.',
}]

export const templates: TemplateDefinition[] = [
  {
    id: 'studio', familyId: 'editorial', name: 'Forma', category: 'Estudio creativo & portfolio', icon: '✳',
    description: 'Tipografía grande, acentos lima y proyectos visuales para una marca con personalidad.',
    settings: { ...defaultSettings, template: 'studio' }, sections: defaultSections,
  },
  restaurantTemplate,
  consultantTemplate,
  retreatTemplate,
  productTemplate,
  coastTemplate,
  atelierTemplate,
  launchTemplate,
  scaleTemplate,
]

export function getTemplate(id: string) {
  return templates.find(template => template.id === id)
}
