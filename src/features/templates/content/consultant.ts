import type { TemplateDefinition } from '../types'

export const consultantTemplate: TemplateDefinition = {
  id: 'consultant', familyId: 'editorial', name: 'Nexo', category: 'Consultoría & servicios', icon: '↗',
  description: 'Una presencia clara y profesional, con fondo oscuro, datos destacados y servicios bien organizados.',
  settings: {
    template: 'consultant', brand: 'nexo', tagline: 'Claridad para decidir. Estrategia para avanzar.',
    email: 'hola@nexo.example', accent: '#a4edc5',
    design: { headingFont: 'system', bodyFont: 'system', width: 'narrow', spacing: 'compact' },
    colors: {
      background: '#101d2b', text: '#f0f5fa', muted: '#a1b2c6', surface: '#192a3c', border: '#304357',
      projectPeach: '#c0d4e7', projectPurple: '#b9c9ef', projectLime: '#acd9c6',
    },
    seoTitle: 'Nexo — Consultoría y estrategia', seoDescription: 'Estrategia, procesos y acompañamiento para hacer crecer tu negocio. Plantilla de servicios profesionales con contenido de ejemplo.',
    navigation: [{ label: 'Servicios', href: '#services' }, { label: 'Nosotros', href: '#about' }, { label: 'Casos', href: '#projects' }],
  },
  sections: [
    {
      blockType: 'hero', eyebrow: 'CONSULTORÍA PARA NEGOCIOS EN MOVIMIENTO', title: 'Tu siguiente paso.\nCon una dirección clara.',
      description: 'Conectamos estrategia, personas y procesos para transformar desafíos en un plan que se pueda llevar a la práctica.', buttonLabel: 'Agendar una conversación',
    },
    {
      blockType: 'services', eyebrow: 'SOLUCIONES CON FOCO', title: 'Ordenar el presente.\nConstruir lo que sigue.',
      description: 'Acompañamiento concreto para tomar mejores decisiones y avanzar con tu equipo.',
      services: [
        { title: 'Estrategia de negocio', description: 'Alineamos prioridades, identificamos oportunidades y convertimos la visión en un plan de acción.', tags: 'Diagnóstico · Planificación · Objetivos' },
        { title: 'Procesos y operación', description: 'Simplificamos cómo se trabaja para que el negocio gane claridad, consistencia y capacidad de crecer.', tags: 'Procesos · Gestión · Mejora continua' },
        { title: 'Equipos y liderazgo', description: 'Acompañamos a las personas que llevan adelante el cambio, con herramientas y conversaciones útiles.', tags: 'Liderazgo · Cultura · Acompañamiento' },
      ],
    },
    { blockType: 'process', eyebrow: 'CÓMO AVANZAMOS', title: 'Un método que baja la estrategia a tierra.', description: 'Cada etapa deja una decisión más clara y un próximo paso posible.', process: [{ title: 'Diagnóstico', description: 'Ponemos sobre la mesa datos, tensiones y oportunidades.', duration: '2 semanas' }, { title: 'Diseño de ruta', description: 'Priorizamos iniciativas y definimos cómo medir el avance.', duration: '3 semanas' }, { title: 'Acompañamiento', description: 'Trabajamos con el equipo hasta que el cambio se vuelva hábito.', duration: 'A medida' }] },
    {
      blockType: 'about', eyebrow: 'UN SOCIO PARA AVANZAR', title: 'Mirada externa.\nCompromiso interno.',
      description: 'Somos una consultora de ejemplo que trabaja cerca de cada equipo. Escuchamos antes de proponer, combinamos análisis con experiencia y acompañamos hasta convertir las ideas en hábitos de trabajo.',
      stats: [{ value: '01', label: 'Plan conectado a tu negocio' }, { value: '360°', label: 'Mirada sobre el desafío' }, { value: '100%', label: 'Trabajo junto a tu equipo' }],
    },
    {
      blockType: 'projects', eyebrow: 'CASOS DE EJEMPLO', title: 'Del desafío\na la acción.',
      description: 'Conceptos de proyectos para mostrar cómo presentar tus servicios y casos. Reemplazalos con experiencias reales.',
      projects: [
        { title: 'Dirección', category: 'ESTRATEGIA · PLAN DE NEGOCIO', description: 'Un diagnóstico compartido y una hoja de ruta para ordenar prioridades, definir responsables y acompañar decisiones.', tone: 'purple' },
        { title: 'Sistema', category: 'OPERACIÓN · MEJORA DE PROCESOS', description: 'Un modelo de trabajo más claro, con procesos documentados y herramientas sencillas para coordinar al equipo.', tone: 'lime' },
      ],
    },
    { blockType: 'logos', eyebrow: 'CON QUIÉNES TRABAJAMOS', title: 'Equipos que decidieron ordenar.', description: 'Marcas ficticias para mostrar cómo presentar la confianza de tus clientes.', logos: [{ name: 'Norte' }, { name: 'Lumen' }, { name: 'Taller 21' }, { name: 'Surco' }] },
    { blockType: 'comparison', eyebrow: 'FORMAS DE ACOMPAÑARTE', title: 'Elegí el nivel de foco.', description: 'Tres maneras de empezar, según el momento y la profundidad que necesita tu negocio.', comparison: [{ title: 'Punto de partida', price: '2 semanas', period: 'Diagnóstico', description: 'Para entender qué está trabando el avance.', features: 'Entrevistas clave\nMapa de prioridades\nRecomendaciones iniciales', buttonLabel: 'Consultar', buttonHref: '#form' }, { title: 'Ruta completa', price: '8 semanas', period: 'Estrategia y plan', description: 'Para transformar el diagnóstico en decisiones compartidas.', features: 'Diagnóstico profundo\nPlan de acción\nSesiones con el equipo', buttonLabel: 'Elegir ruta', buttonHref: '#form', featured: true }] },
    {
      blockType: 'faq', eyebrow: 'PREGUNTAS PARA EMPEZAR', title: 'Sin vueltas.',
      questions: [
        { question: '¿Cómo empieza un proyecto?', answer: 'Con una primera conversación para conocer tu contexto. Después definimos un alcance, un calendario y las personas que van a participar.' },
        { question: '¿Trabajan con negocios pequeños?', answer: 'Sí. Adaptamos el acompañamiento al tamaño del equipo y al momento del negocio. Lo importante es tener un desafío concreto y ganas de avanzar.' },
        { question: '¿El acompañamiento puede ser remoto?', answer: 'Sí, combinamos encuentros online y espacios de trabajo compartidos. También podemos coordinar sesiones presenciales cuando el proyecto lo requiere.' },
      ],
    },
    { blockType: 'cta', eyebrow: 'UNA DECISIÓN CONCRETA', title: 'Menos ruido.\nMás dirección.', description: 'Si hay algo que querés destrabar, podemos empezar por ahí.', actions: [{ label: 'Contanos el desafío', href: '#form', style: 'primary' }] },
    { blockType: 'form', eyebrow: 'PRIMERA CONVERSACIÓN', title: '¿Qué querés ordenar?', description: 'Contanos dónde está el desafío y qué tendría que cambiar para que el proyecto avance.', formFields: [{ label: 'Nombre', name: 'name', type: 'text', required: true }, { label: 'Email', name: 'email', type: 'email', required: true }, { label: 'Desafío', name: 'message', type: 'textarea', required: true }], formSubmitLabel: 'Contar el desafío', formSuccessMessage: 'Gracias. Te contactamos para entender mejor el contexto.' },
    {
      blockType: 'contact', eyebrow: 'EMPECEMOS POR UNA CONVERSACIÓN', title: 'El futuro necesita\nun primer paso.',
      description: 'Contanos qué querés mejorar. Pensemos juntos cómo avanzar.', buttonLabel: 'Hablemos de tu negocio',
    },
  ],
}
