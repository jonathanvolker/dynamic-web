import type { TemplateDefinition } from '../types'

export const productTemplate: TemplateDefinition = {
  id: 'product', familyId: 'modular', name: 'Vector', category: 'Producto digital & servicios', icon: '▰',
  description: 'Una portada centrada, demostración de producto, beneficios modulares y planes claros para convertir visitas en conversaciones.',
  settings: {
    template: 'product', brand: 'vector', tagline: 'Menos fricción. Más equipo.', email: 'hola@vector.example', accent: '#6554d9',
    colors: { background: '#f8f9fc', text: '#18213a', muted: '#68728a', surface: '#ffffff', border: '#dfe4ef', projectPeach: '#e7eaff', projectPurple: '#dcd7fa', projectLime: '#dcf0e9' },
    seoTitle: 'Vector — Un espacio para que las cosas pasen', seoDescription: 'Plantilla de producto digital ficticio. Presentá beneficios, testimonios y planes con una composición modular.',
    headerButton: { label: 'Hablemos de tu equipo', href: '#contact' },
    navigation: [{ label: 'Beneficios', href: '#services' }, { label: 'Opiniones', href: '#testimonials' }, { label: 'Planes', href: '#pricing' }],
  },
  sections: [
    { blockType: 'hero', eyebrow: 'TU EQUIPO. EN LA MISMA DIRECCIÓN.', title: 'Menos pestañas.\nMás cosas hechas.', description: 'Un espacio para ordenar proyectos, conectar a tu equipo y convertir las buenas ideas en próximos pasos.', heroLayout: 'centered', buttonLabel: 'Encontrá tu plan', buttonHref: '#pricing' },
    { blockType: 'services', eyebrow: 'TODO EN SU LUGAR', title: 'El trabajo fluye\ncuando todo conecta.', description: 'Beneficios de un producto de ejemplo. Adaptalos a lo que realmente ofrece tu negocio.', services: [
      { title: 'Una vista completa', description: 'Pasá de conversaciones dispersas a un panorama claro de lo que importa esta semana.', tags: '01 · CLARIDAD' },
      { title: 'Menos tareas repetidas', description: 'Mostrá cómo tu producto ayuda a simplificar el día a día y recuperar tiempo.', tags: '02 · SIMPLICIDAD' },
      { title: 'Mejor en equipo', description: 'Dale a cada persona el contexto que necesita para avanzar con autonomía.', tags: '03 · COLABORACIÓN' },
    ] },
    { blockType: 'testimonials', eyebrow: 'LA EXPERIENCIA IMPORTA', title: 'Equipos que encuentran\nsu manera de avanzar.', description: 'Opiniones ilustrativas. Reemplazalas por testimonios verificados de tus clientes.', testimonials: [
      { quote: 'Por fin una forma de ver qué está pasando sin preguntar en cinco lugares distintos.', name: 'Sofía R.', role: 'Operaciones · ejemplo' },
      { quote: 'Lo mejor es lo rápido que el equipo entendió por dónde empezar.', name: 'Diego M.', role: 'Producto · ejemplo' },
      { quote: 'Menos reuniones para ponernos al día. Más tiempo para hacer.', name: 'Ana P.', role: 'Diseño · ejemplo' },
    ] },
    { blockType: 'pricing', eyebrow: 'SIMPLE DESDE EL PRINCIPIO', title: 'Un plan para\ntu próximo paso.', description: 'Precios ilustrativos, sin cobro automático. Cada botón abre una consulta.', plans: [
      { title: 'Inicio', price: 'US$ 0', period: 'Para explorar la propuesta', description: 'Una primera forma de organizarte.', features: 'Espacio personal\nProyectos de muestra\nGuía para empezar', buttonLabel: 'Conocer Inicio', buttonHref: 'mailto:hola@vector.example' },
      { title: 'Equipo', price: 'US$ 19', period: 'Por persona / mes · ejemplo', description: 'Un lugar compartido para avanzar juntos.', features: 'Proyectos compartidos\nVistas de equipo\nAcompañamiento inicial\nSoporte prioritario', buttonLabel: 'Consultar Equipo', buttonHref: 'mailto:hola@vector.example', featured: true },
      { title: 'A medida', price: 'Hablemos', period: 'Según las necesidades de tu equipo', description: 'Una propuesta conectada a tu organización.', features: 'Alcance personalizado\nImplementación acompañada\nCanal de soporte dedicado', buttonLabel: 'Pedir una propuesta', buttonHref: '#contact' },
    ] },
    { blockType: 'faq', eyebrow: 'ANTES DE EMPEZAR', title: 'Las cosas claras.', questions: [
      { question: '¿Esto es un producto real?', answer: 'Vector es una plantilla para presentar tu producto o servicio. Sus funciones, precios y testimonios son ejemplos editables.' },
      { question: '¿Los planes incluyen pagos automáticos?', answer: 'No. Los botones están conectados a consultas por email o a una sección. Podés cambiar sus destinos desde el editor.' },
      { question: '¿Puedo adaptarla a mi negocio?', answer: 'Sí. Cambiá textos, imágenes, colores, tipografía y composición. Agregá o quitá bloques según tu propuesta.' },
    ] },
    { blockType: 'contact', eyebrow: 'HAGAMOS ESPACIO PARA LO QUE SIGUE', title: 'Tu próximo gran paso\npuede ser más simple.', description: 'Contanos cómo trabaja tu equipo y qué te gustaría mejorar.', buttonLabel: 'Empezar la conversación' },
  ],
}
