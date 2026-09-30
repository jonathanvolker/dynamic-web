import type { TemplateDefinition } from '../types'

export const consultantTemplate: TemplateDefinition = {
  id: 'consultant', name: 'Nexo', category: 'Consultoría & servicios', icon: '↗',
  description: 'Una presencia clara y profesional, con fondo oscuro, datos destacados y servicios bien organizados.',
  settings: {
    template: 'consultant', brand: 'nexo', tagline: 'Claridad para decidir. Estrategia para avanzar.',
    email: 'hola@nexo.example', accent: '#a4edc5',
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
    {
      blockType: 'faq', eyebrow: 'PREGUNTAS PARA EMPEZAR', title: 'Sin vueltas.',
      questions: [
        { question: '¿Cómo empieza un proyecto?', answer: 'Con una primera conversación para conocer tu contexto. Después definimos un alcance, un calendario y las personas que van a participar.' },
        { question: '¿Trabajan con negocios pequeños?', answer: 'Sí. Adaptamos el acompañamiento al tamaño del equipo y al momento del negocio. Lo importante es tener un desafío concreto y ganas de avanzar.' },
        { question: '¿El acompañamiento puede ser remoto?', answer: 'Sí, combinamos encuentros online y espacios de trabajo compartidos. También podemos coordinar sesiones presenciales cuando el proyecto lo requiere.' },
      ],
    },
    {
      blockType: 'contact', eyebrow: 'EMPECEMOS POR UNA CONVERSACIÓN', title: 'El futuro necesita\nun primer paso.',
      description: 'Contanos qué querés mejorar. Pensemos juntos cómo avanzar.', buttonLabel: 'Hablemos de tu negocio',
    },
  ],
}
