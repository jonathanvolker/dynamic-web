import type { TemplateDefinition } from '../types'

export const restaurantTemplate: TemplateDefinition = {
  id: 'restaurant', familyId: 'editorial', name: 'Brasa', category: 'Restaurante & gastronomía', icon: '◒',
  description: 'Sabores de estación, tonos tierra y una composición editorial para invitar a sentarse a la mesa.',
  settings: {
    template: 'restaurant', brand: 'brasa', tagline: 'Cocina de estación. Encuentros que se quedan.',
    email: 'reservas@brasa.example', accent: '#ad462e',
    design: { headingFont: 'serif', bodyFont: 'dm-sans', width: 'standard', spacing: 'airy' },
    colors: {
      background: '#faf3e9', text: '#3e3025', muted: '#806957', surface: '#eee2d1', border: '#dccbb7',
      projectPeach: '#d5a171', projectPurple: '#a9b18b', projectLime: '#e6c890',
    },
    seoTitle: 'Brasa — Cocina de estación', seoDescription: 'Una mesa, ingredientes de estación y una cocina hecha con tiempo. Plantilla de restaurante con contenido de ejemplo.',
    navigation: [{ label: 'La cocina', href: '#services' }, { label: 'El menú', href: '#projects' }, { label: 'Nuestra casa', href: '#about' }],
  },
  sections: [
    {
      blockType: 'hero', eyebrow: 'COCINA DE ESTACIÓN · HECHA CON TIEMPO',
      title: 'El placer de\nvolver a la mesa.',
      description: 'Ingredientes cercanos, fuego lento y una mesa que siempre tiene lugar para una buena historia.', buttonLabel: 'Reservar una mesa',
    },
    {
      blockType: 'services', eyebrow: 'LO SIMPLE, BIEN HECHO', title: 'Nuestra forma\nde cocinar.',
      description: 'La temporada decide el menú. Nosotros ponemos las manos, el tiempo y las ganas.',
      services: [
        { title: 'Producto de estación', description: 'Trabajamos con pequeños productores y elegimos lo que está en su mejor momento.', tags: 'Cercanía · Frescura · Origen' },
        { title: 'Fuego y oficio', description: 'Cocciones lentas, pan de masa madre y recetas que encuentran su lugar junto al fuego.', tags: 'Brasa · Fermentación · Cocina artesanal' },
        { title: 'Una mesa compartida', description: 'Platos para probar, compartir y conversar. Porque comer también es encontrarse.', tags: 'Encuentros · Celebraciones · Sobremesa' },
      ],
    },
    {
      blockType: 'projects', eyebrow: 'UNA MUESTRA DEL MENÚ', title: 'Sabores que\ncuentan el lugar.',
      description: 'Tres propuestas de ejemplo. Personalizá los platos y cargá las fotos de tu cocina desde el editor.',
      projects: [
        { title: 'La huerta', category: 'ENTRADA · VEGETALES DE ESTACIÓN', description: 'Vegetales asados, crema de almendras y hojas frescas. Una entrada que cambia con lo que trae la huerta.', tone: 'purple' },
        { title: 'El fuego', category: 'PRINCIPAL · COCINA A LA BRASA', description: 'El corte del día, cocinado con paciencia, acompañado de papas al rescoldo y salsa de hierbas.', tone: 'peach' },
        { title: 'Algo dulce', category: 'POSTRE · HECHO EN CASA', description: 'Fruta de estación, crema suave y un crocante de frutos secos. El final perfecto para una larga sobremesa.', tone: 'lime' },
      ],
    },
    {
      blockType: 'menu', eyebrow: 'LA CARTA', title: 'Platos para compartir.', description: 'Una carta breve, pensada para cambiar con la temporada.',
      menu: [
        { category: 'Para empezar', name: 'Berenjenas al rescoldo', description: 'Yogur de hierbas, nueces tostadas y pan de masa madre.', price: '$ 8.500', dietary: 'Vegetariano' },
        { category: 'Principales', name: 'Pesca del día', description: 'Vegetales de estación, manteca de limón y jugo de hierbas.', price: '$ 19.000', dietary: 'Consultar disponibilidad' },
        { category: 'Para terminar', name: 'Peras al fuego', description: 'Crema de vainilla, miel y crocante de almendras.', price: '$ 7.000', dietary: 'Sin gluten' },
      ],
    },
    {
      blockType: 'about', eyebrow: 'UNA CASA ABIERTA', title: 'Acá, el tiempo\nva un poco más lento.',
      description: 'Brasa es un concepto de restaurante de barrio. Una cocina abierta, mesas sin apuro y una carta corta que cambia con las estaciones. Nos gusta recibir, cocinar y hacer que quieras volver.',
      stats: [{ value: '4', label: 'Estaciones, nuevas ideas' }, { value: '100%', label: 'Hecho en nuestra cocina' }, { value: '∞', label: 'Buenas sobremesas' }],
    },
    {
      blockType: 'faq', eyebrow: 'ANTES DE VENIR', title: 'Te esperamos.',
      questions: [
        { question: '¿Cómo hago una reserva?', answer: 'Escribinos por email con la fecha, el horario y la cantidad de personas. Te respondemos para confirmar disponibilidad. Esta plantilla no incluye un sistema automático de reservas.' },
        { question: '¿Hay opciones vegetarianas?', answer: 'Sí, los vegetales de estación tienen un lugar importante en nuestra cocina. Consultanos también por otras necesidades alimentarias.' },
        { question: '¿Puedo organizar una celebración?', answer: 'Podemos pensar juntos una mesa especial y un menú para compartir. Contanos qué tenés en mente y cuántas personas vienen.' },
      ],
    },
    { blockType: 'hours', eyebrow: 'ENCONTRANOS', title: 'La cocina abre sus puertas.', description: 'Consultá horarios, dirección y disponibilidad antes de venir.', address: 'Pasaje del Mercado 42, Buenos Aires', phone: '+5491100000000', mapHref: 'https://maps.google.com', hours: [{ day: 'Martes a jueves', hours: '19:00 a 23:30' }, { day: 'Viernes y sábado', hours: '19:00 a 00:30' }, { day: 'Domingo', hours: '12:00 a 16:00' }] },
    { blockType: 'form', eyebrow: 'RESERVAS', title: 'Guardamos un lugar para vos.', description: 'Escribinos con la fecha, el horario y la cantidad de personas.', formFields: [{ label: 'Nombre', name: 'name', type: 'text', required: true }, { label: 'Email', name: 'email', type: 'email', required: true }, { label: 'Consulta', name: 'message', type: 'textarea', required: true }], formSubmitLabel: 'Consultar disponibilidad', formSuccessMessage: 'Recibimos tu consulta. Te confirmamos disponibilidad pronto.' },
    { blockType: 'newsletter', eyebrow: 'DE LA COCINA', title: 'El menú cambia. Te avisamos.', description: 'Novedades de temporada, mesas especiales y alguna receta para llevarte a casa.', newsletterLabel: 'Tu email', newsletterConsent: 'Acepto recibir novedades de Brasa.', formSubmitLabel: 'Avisarme', formSuccessMessage: 'Listo. Te contamos cuando haya algo nuevo.' },
    {
      blockType: 'contact', eyebrow: 'GUARDAMOS UN LUGAR PARA VOS', title: 'La mesa está puesta.',
      description: 'Escribinos para reservar o planear tu próximo encuentro.', buttonLabel: 'Consultar una reserva',
    },
  ],
}
