import type { Section, Settings } from '../types'

export const defaultSettings: Settings = {
  brand: 'forma', tagline: 'Ideas con intención. Diseño con carácter.', email: 'hola@forma.example', accent: '#d6f76b',
  design: { headingFont: 'dm-sans', bodyFont: 'dm-sans', width: 'wide', spacing: 'airy' },
  seoTitle: 'Forma — Diseño que mueve tu marca', seoDescription: 'Estudio creativo de branding, diseño web y experiencias digitales. Marca y proyectos de demostración.',
  navigation: [{ label: 'Servicios', href: '#services' }, { label: 'Proyectos', href: '#projects' }, { label: 'El estudio', href: '#about' }],
}

export const defaultSections: Section[] = [
  { blockType: 'hero', eyebrow: 'ESTUDIO INDEPENDIENTE · DISEÑO & DIGITAL', title: 'Buenas ideas.\nGrandes formas.', description: 'Transformamos marcas en experiencias que se sienten, se recuerdan y hacen la diferencia.', buttonLabel: 'Exploremos tu idea' },
  { blockType: 'services', eyebrow: '01 / LO QUE HACEMOS', title: 'De la primera idea\nal último detalle.', description: 'Estrategia, diseño y tecnología. Todo conectado para que tu marca llegue más lejos.', services: [
    { title: 'Identidad de marca', description: 'Encontramos lo que te hace único y lo convertimos en una identidad imposible de ignorar.', tags: 'Estrategia · Branding · Dirección de arte' },
    { title: 'Experiencias digitales', description: 'Webs que se ven increíble, funcionan de verdad y crecen junto a tu negocio.', tags: 'Diseño web · Desarrollo · E-commerce' },
    { title: 'Contenido con sentido', description: 'Construimos un universo visual coherente en cada punto de contacto con tu audiencia.', tags: 'Campañas · Social media · Diseño editorial' },
  ] },
  { blockType: 'projects', eyebrow: '02 / TRABAJO SELECCIONADO', title: 'Menos de lo mismo.\nMás de lo tuyo.', description: 'Una selección de conceptos que muestran cómo pensamos y diseñamos.', projects: [
    { title: 'Oliva', category: 'BRANDING · PACKAGING', description: 'Concepto de identidad para una marca de cuidado natural. Colores cálidos, formas orgánicas y una personalidad fresca que conecta con lo esencial.', tone: 'peach' },
    { title: 'Orbit', category: 'ESTRATEGIA · DISEÑO WEB', description: 'Concepto digital para una nueva generación de productos tecnológicos. Una identidad en movimiento, con un lenguaje visual audaz y flexible.', tone: 'purple' },
    { title: 'Marea', category: 'IDENTIDAD · DIRECCIÓN DE ARTE', description: 'Concepto de marca para una comunidad creativa. Un sistema tipográfico expresivo y una paleta que invita a pensar de otra manera.', tone: 'lime' },
  ] },
  { blockType: 'about', eyebrow: '03 / EL ESTUDIO', title: 'Un equipo pequeño.\nUna mirada grande.', description: 'Nos gustan las buenas preguntas, las ideas valientes y trabajar cerca. Combinamos sensibilidad creativa con pensamiento estratégico para construir algo que realmente sea tuyo.', stats: [{ value: '01', label: 'Equipo conectado' }, { value: '100%', label: 'Diseño con intención' }, { value: '∞', label: 'Ideas por explorar' }] },
  { blockType: 'textImage', eyebrow: 'UNA FORMA DE TRABAJAR', title: 'Pensar primero.\nDiseñar después.', description: 'Cada proyecto empieza con una conversación honesta, referencias compartidas y una dirección que se pueda explicar. La forma aparece cuando la idea está clara.', textImageLayout: 'image-right' },
  { blockType: 'team', eyebrow: 'LAS PERSONAS', title: 'Un equipo chico, cerca.', description: 'Presentá a quienes le ponen pensamiento, oficio y sensibilidad a cada entrega.', team: [{ name: 'Sofía y equipo', role: 'Dirección creativa', bio: 'Un equipo multidisciplinario que trabaja con marcas que quieren decir algo propio.' }, { name: 'Colaboradores', role: 'Red de especialistas', bio: 'Fotografía, desarrollo y estrategia cuando el proyecto necesita otra mirada.' }] },
  { blockType: 'process', eyebrow: '04 / EL RECORRIDO', title: 'De la pregunta\na una forma propia.', description: 'Un proceso claro para que cada decisión tenga sentido.', process: [{ title: 'Escuchamos', description: 'Entendemos el contexto, el desafío y lo que querés provocar.', duration: 'Semana 01' }, { title: 'Damos forma', description: 'Exploramos rutas visuales y construimos un sistema que pueda crecer.', duration: 'Semanas 02–04' }, { title: 'Activamos', description: 'Preparamos las piezas y acompañamos la salida al mundo.', duration: 'Desde semana 05' }] },
  { blockType: 'faq', eyebrow: '04 / ANTES DE EMPEZAR', title: 'Hablemos claro.', questions: [
    { question: '¿Cómo es trabajar con ustedes?', answer: 'Primero escuchamos. Definimos objetivos, exploramos una dirección creativa y desarrollamos la propuesta juntos. Vas a tener un interlocutor y claridad sobre cada etapa.' },
    { question: '¿Voy a poder editar mi web?', answer: 'Sí. Tendrás un panel para editar textos, subir imágenes y agregar o reordenar secciones. Te entregamos una estructura visual consistente y te enseñamos a usarla.' },
    { question: '¿Cuánto tarda un proyecto?', answer: 'Depende del alcance y del contenido disponible. Después de la primera charla armamos un calendario concreto, con etapas y entregas claras.' },
    { question: '¿Podemos trabajar a distancia?', answer: 'Claro. Organizamos reuniones y entregas online para que la colaboración sea fluida, estés donde estés.' },
  ] },
  { blockType: 'cta', eyebrow: 'UNA IDEA MERECE UN PRÓXIMO PASO', title: '¿Qué podemos\nhacer visible?', description: 'Contanos dónde estás y qué te gustaría transformar.', actions: [{ label: 'Hablemos', href: '#form', style: 'primary' }, { label: 'Ver proyectos', href: '#projects', style: 'secondary' }] },
  { blockType: 'form', eyebrow: '05 / EMPECEMOS', title: 'Contanos qué estás pensando.', description: 'Un poco de contexto alcanza para empezar una conversación útil.', formFields: [{ label: 'Nombre', name: 'name', type: 'text', required: true }, { label: 'Email', name: 'email', type: 'email', required: true }, { label: 'Proyecto', name: 'message', type: 'textarea', required: true }], formSubmitLabel: 'Enviar proyecto', formSuccessMessage: 'Gracias. Te escribimos para seguir la conversación.' },
  { blockType: 'newsletter', eyebrow: 'NOTAS DE FORMA', title: 'Ideas para mirar distinto.', description: 'Una carta breve con referencias, procesos y cosas que nos inspiran.', newsletterLabel: 'Tu email', newsletterConsent: 'Acepto recibir notas ocasionales.', formSubmitLabel: 'Recibir notas', formSuccessMessage: 'Listo. La próxima nota llega pronto.' },
  { blockType: 'contact', eyebrow: '¿TENÉS ALGO EN MENTE?', title: 'Démosle forma.', description: 'Las mejores cosas empiezan con una conversación.', buttonLabel: 'Contanos tu idea' },
]
