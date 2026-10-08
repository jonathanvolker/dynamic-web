import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig, type Block, type Field } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { es } from '@payloadcms/translations/languages/es'
import sharp from 'sharp'
import { defaultSections, defaultSettings } from '@/features/website/content/defaults'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(dirname, '../../..')
const isAdmin = ({ req }: { req: { user?: { role?: string; email?: string } | null } }) => {
  const configured = (process.env.PLATFORM_ADMIN_EMAILS || '').split(',').map(email => email.trim().toLowerCase()).filter(Boolean)
  return req.user?.role === 'admin' || Boolean(req.user?.email && configured.includes(req.user.email.toLowerCase()))
}
const text = (name: string, label: string, required = true): Field => ({ name, label, type: 'text', required })
const common: Field[] = [text('eyebrow', 'Etiqueta superior'), { name: 'title', label: 'Título (admite saltos de línea)', type: 'textarea', required: true }, { name: 'description', label: 'Descripción', type: 'textarea' }]
const block = (slug: string, singular: string, fields: Field[]): Block => ({ slug, labels: { singular, plural: singular }, fields: [...common, ...fields] })
const row = (name: string, label: string, multiline = false, required = true): Field => multiline
  ? { name, label, type: 'textarea', required }
  : { name, label, type: 'text', required }
const rows = (name: string, label: string, fields: Field[]): Field => ({ name, label, type: 'array', fields })
const image = (name = 'image'): Field => ({ name, label: 'Imagen', type: 'upload', relationTo: 'media' })
const blocks: Block[] = [
  block('hero', 'Portada', [text('buttonLabel', 'Texto del botón'), text('buttonHref', 'Destino del botón', false), { name: 'heroLayout', label: 'Composición', type: 'select', options: [{ label: 'Partida', value: 'split' }, { label: 'Centrada', value: 'centered' }, { label: 'Portada', value: 'cover' }] }, image(), { name: 'imagePosition', label: 'Posición de imagen', type: 'select', options: [{ label: 'Centro', value: 'center' }, { label: 'Arriba', value: 'top' }, { label: 'Abajo', value: 'bottom' }] }]),
  block('services', 'Servicios', [rows('services', 'Servicios', [row('title', 'Nombre'), row('description', 'Descripción', true), row('tags', 'Especialidades')])]),
  block('projects', 'Proyectos', [rows('projects', 'Proyectos', [row('title', 'Nombre'), row('category', 'Categoría'), row('description', 'Detalle del proyecto', true), { name: 'tone', label: 'Estilo gráfico', type: 'select', required: true, defaultValue: 'peach', options: [{ label: 'Durazno', value: 'peach' }, { label: 'Violeta', value: 'purple' }, { label: 'Lima', value: 'lime' }] }, image()])]),
  block('about', 'Estudio / Nosotros', [rows('stats', 'Datos destacados', [row('value', 'Valor'), row('label', 'Descripción')])]),
  block('faq', 'Preguntas frecuentes', [rows('questions', 'Preguntas', [row('question', 'Pregunta'), row('answer', 'Respuesta', true)])]),
  block('contact', 'Contacto', [text('buttonLabel', 'Texto del botón'), text('buttonHref', 'Destino del botón', false)]),
  block('gallery', 'Galería', [rows('gallery', 'Imágenes', [row('title', 'Nombre'), row('description', 'Pie de imagen', true), image()])]),
  block('testimonials', 'Testimonios', [rows('testimonials', 'Testimonios', [row('quote', 'Testimonio', true), row('name', 'Nombre'), row('role', 'Rol o contexto')])]),
  block('pricing', 'Planes y precios', [rows('plans', 'Planes', [row('title', 'Nombre del plan'), row('price', 'Precio o valor'), row('period', 'Período'), row('description', 'Descripción', true), row('features', 'Incluye', true), row('buttonLabel', 'Texto del botón'), row('buttonHref', 'Destino del plan'), { name: 'featured', label: 'Destacado', type: 'checkbox' }])]),
  block('cta', 'CTA destacado', [rows('actions', 'Acciones', [row('label', 'Texto del botón'), row('href', 'Destino'), { name: 'style', label: 'Estilo', type: 'select', options: [{ label: 'Principal', value: 'primary' }, { label: 'Secundario', value: 'secondary' }] }])]),
  block('textImage', 'Texto + imagen', [image(), { name: 'textImageLayout', label: 'Ubicación de imagen', type: 'select', options: [{ label: 'Izquierda', value: 'image-left' }, { label: 'Derecha', value: 'image-right' }] }, { name: 'imagePosition', label: 'Posición de imagen', type: 'select', options: [{ label: 'Centro', value: 'center' }, { label: 'Arriba', value: 'top' }, { label: 'Abajo', value: 'bottom' }] }]),
  block('video', 'Video o embed', [{ name: 'videoProvider', label: 'Proveedor', type: 'select', options: [{ label: 'YouTube', value: 'youtube' }, { label: 'Vimeo', value: 'vimeo' }] }, text('videoId', 'Identificador del video', false), text('videoTitle', 'Título accesible del video', false)]),
  block('logos', 'Logos de clientes', [rows('logos', 'Logos', [row('name', 'Nombre'), image(), row('href', 'Enlace opcional', false, false)])]),
  block('team', 'Equipo', [rows('team', 'Personas', [row('name', 'Nombre'), row('role', 'Rol'), row('bio', 'Biografía', true), image(), row('href', 'Perfil opcional', false, false)])]),
  block('stats', 'Estadísticas', [rows('stats', 'Estadísticas', [row('value', 'Valor'), row('label', 'Descripción')])]),
  block('process', 'Proceso', [rows('process', 'Pasos', [row('title', 'Paso'), row('description', 'Descripción', true), row('duration', 'Duración opcional', false, false)])]),
  block('comparison', 'Comparativa de planes', [rows('comparison', 'Planes comparables', [row('title', 'Plan'), row('price', 'Precio'), row('period', 'Período'), row('description', 'Descripción', true), row('features', 'Características', true), row('buttonLabel', 'Texto del botón'), row('buttonHref', 'Destino'), { name: 'featured', label: 'Destacado', type: 'checkbox' }])]),
  block('form', 'Formulario de contacto', [rows('formFields', 'Campos', [row('label', 'Etiqueta'), row('name', 'Nombre técnico'), row('type', 'Tipo'), { name: 'required', label: 'Obligatorio', type: 'checkbox' }]), text('formSubmitLabel', 'Texto de envío'), { name: 'formSuccessMessage', label: 'Mensaje de éxito', type: 'textarea' }]),
  block('newsletter', 'Newsletter', [text('newsletterLabel', 'Etiqueta del email'), { name: 'newsletterConsent', label: 'Texto de consentimiento', type: 'textarea' }, text('formSubmitLabel', 'Texto de envío'), { name: 'formSuccessMessage', label: 'Mensaje de éxito', type: 'textarea' }]),
  block('menu', 'Carta gastronómica', [rows('menu', 'Platos y bebidas', [row('category', 'Categoría'), row('name', 'Nombre'), row('description', 'Descripción', true), row('price', 'Precio'), row('dietary', 'Información dietaria', false, false)])]),
  block('hours', 'Horarios y ubicación', [text('address', 'Dirección'), text('phone', 'Teléfono'), text('mapHref', 'Enlace del mapa'), rows('hours', 'Horarios', [row('day', 'Día'), row('hours', 'Horario')])]),
  { slug: 'footer', labels: { singular: 'Pie de página', plural: 'Pie de página' }, fields: [text('footerTagline', 'Frase del pie'), text('footerEmail', 'Email del pie'), rows('footerNavigation', 'Navegación del pie', [row('label', 'Texto'), row('href', 'Destino')]), text('footerExploreLabel', 'Etiqueta Explorar'), text('footerContactLabel', 'Etiqueta Contacto'), text('footerCopyright', 'Copyright', false)] },
]

export default buildConfig({
  admin: { user: 'users', importMap: { baseDir: root }, meta: { titleSuffix: '— Forma · Editor' } },
  i18n: { supportedLanguages: { es }, fallbackLanguage: 'es' },
  secret: process.env.PAYLOAD_SECRET || (process.env.DATABASE_URI ? '' : 'demo-only-not-connected-to-a-database'),
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  csrf: [process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'],
  db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URI || '' }, push: process.env.NODE_ENV !== 'production', migrationDir: path.resolve(dirname, 'migrations') }),
  sharp,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  collections: [
    { slug: 'users', labels: { singular: 'Usuario', plural: 'Usuarios' }, auth: true, admin: { useAsTitle: 'email' }, fields: [], access: { create: isAdmin, read: isAdmin, update: isAdmin, delete: isAdmin } },
    { slug: 'media', labels: { singular: 'Imagen', plural: 'Biblioteca de imágenes' }, upload: { staticDir: path.resolve(root, 'media'), mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'], imageSizes: [{ name: 'card', width: 1200, height: 900, position: 'centre' }] }, access: { read: () => true, create: isAdmin, update: isAdmin, delete: isAdmin }, fields: [text('alt', 'Descripción de la imagen (accesibilidad)')] },
  ],
  globals: [
    { slug: 'settings', label: 'Ajustes del sitio', access: { read: () => true, update: isAdmin }, fields: [text('brand', 'Marca'), text('tagline', 'Frase del pie de página'), { name: 'email', label: 'Email de contacto', type: 'email', required: true }, { name: 'accent', label: 'Color de acento (#RRGGBB)', type: 'text', required: true, validate: (value: unknown) => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? true : 'Ingresá un color hexadecimal de seis dígitos.' }, text('seoTitle', 'Título SEO'), { name: 'seoDescription', label: 'Descripción SEO', type: 'textarea', required: true }, { name: 'navigation', label: 'Menú', type: 'array', maxRows: 5, fields: [text('label', 'Texto'), { name: 'href', label: 'Destino (ancla, ruta o https://)', type: 'text', required: true, validate: (value: unknown) => typeof value === 'string' && /^(#[a-zA-Z0-9_-]+|\/(?!\/)|https:\/\/)/.test(value) ? true : 'Usá #seccion, /ruta o https://...' }] }] },
    { slug: 'home', label: 'Página de inicio', access: { read: ({ req }) => req.user ? true : { _status: { equals: 'published' } }, update: isAdmin }, versions: { drafts: true, max: 20 }, fields: [{ name: 'sections', label: 'Secciones (arrastrá para reordenar)', type: 'blocks', blocks }] },
  ],
  onInit: async (payload) => {
    const settings = await payload.findGlobal({ slug: 'settings' })
    if (!settings.brand) await payload.updateGlobal({ slug: 'settings', data: defaultSettings })
    const home = await payload.findGlobal({ slug: 'home' })
    if (!home.sections) await payload.updateGlobal({ slug: 'home', data: { sections: defaultSections, _status: 'published' } })
  },
})
