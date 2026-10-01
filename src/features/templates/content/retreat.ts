import type { TemplateDefinition } from '../types'
import { templatePhotos } from '@/features/website/content/media'

export const retreatTemplate: TemplateDefinition = {
  id: 'retreat', familyId: 'immersive', name: 'Alba', category: 'Hospitalidad & experiencias', icon: '☼',
  description: 'Fotografía a todo lo ancho, una navegación liviana y un recorrido visual que invita a bajar el ritmo.',
  settings: {
    template: 'retreat', brand: 'alba', tagline: 'Un lugar para volver a lo simple.', email: 'hola@alba.example', accent: '#bda17b',
    colors: { background: '#f5f2eb', text: '#26372e', muted: '#69766b', surface: '#e8e6dc', border: '#d5d8cc', projectPeach: '#c7b298', projectPurple: '#bdc8b6', projectLime: '#ddd3b8' },
    seoTitle: 'Alba — Un refugio entre montañas', seoDescription: 'Plantilla fotográfica de un alojamiento ficticio. Naturaleza, descanso y experiencias cercanas.',
    headerButton: { label: 'Planear mi visita', href: '#contact' },
    navigation: [{ label: 'El refugio', href: '#about' }, { label: 'Descubrir', href: '#gallery' }, { label: 'Experiencias', href: '#services' }],
  },
  sections: [
    { blockType: 'hero', eyebrow: 'UN REFUGIO ENTRE MONTAÑAS', title: 'Lejos del ruido.\nCerca de vos.', description: 'Despertar con el bosque. Caminar sin apuro. Encontrar ese tiempo que siempre falta.', heroLayout: 'cover', image: templatePhotos.lake, buttonLabel: 'Conocé el refugio', buttonHref: '#about' },
    { blockType: 'about', eyebrow: 'HABITAR EL PAISAJE', title: 'Hay lugares que\nte cambian el ritmo.', description: 'Alba es una propuesta de alojamiento de ejemplo, pensada para quienes encuentran lujo en lo esencial: una buena conversación, una ventana al paisaje y el espacio para descansar.', image: templatePhotos.house, stats: [{ value: '12', label: 'Habitaciones imaginadas' }, { value: '4', label: 'Estaciones para descubrir' }, { value: '∞', label: 'Momentos sin apuro' }] },
    { blockType: 'gallery', eyebrow: 'UN PEQUEÑO RECORRIDO', title: 'Dejá que el lugar\nhable por sí mismo.', description: 'Fotografías de referencia. Reemplazalas por imágenes de tu espacio desde el editor.', gallery: [
      { title: 'Despertar distinto', description: 'Una habitación abierta al descanso.', image: templatePhotos.room },
      { title: 'La vida afuera', description: 'Senderos, árboles y encuentros inesperados.', image: templatePhotos.forest },
      { title: 'Todo empieza acá', description: 'El paisaje como parte de cada día.', image: templatePhotos.lake },
    ] },
    { blockType: 'services', eyebrow: 'A TU PROPIO RITMO', title: 'Pequeños planes.\nGrandes recuerdos.', description: 'Experiencias de muestra para contar lo que hace único a tu lugar.', services: [
      { title: 'Salir a caminar', description: 'Senderos que empiezan cerca y terminan donde tengas ganas. Un mapa, aire fresco y tiempo.', tags: 'NATURALEZA · EXPLORAR' },
      { title: 'Sentarse a la mesa', description: 'Sabores de temporada y una cocina que celebra los productos del lugar.', tags: 'COCINA · COMPARTIR' },
      { title: 'No hacer nada', description: 'Un libro, una taza caliente y el paisaje. A veces el mejor plan es dejar espacio.', tags: 'DESCANSO · BIENESTAR' },
    ] },
    { blockType: 'testimonials', eyebrow: 'HISTORIAS PARA COMPARTIR', title: 'Lo que se queda\ndespués del viaje.', description: 'Testimonios ficticios de muestra; usá experiencias reales de tus huéspedes.', testimonials: [
      { quote: 'Volvimos con menos fotos de las que esperábamos y muchas más ganas de quedarnos.', name: 'Lucía y Martín', role: 'Una escapada de ejemplo' },
      { quote: 'La sensación de que, por unos días, el reloj dejó de apurar.', name: 'Clara', role: 'Historia de muestra' },
    ] },
    { blockType: 'contact', eyebrow: 'TU PRÓXIMA PAUSA', title: 'Nos encontramos\nen Alba.', description: 'Contanos cuándo te gustaría venir. Esta plantilla usa consultas por email, no reservas automáticas.', buttonLabel: 'Consultar disponibilidad' },
  ],
}
