import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig, type Block, type Field } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { es } from '@payloadcms/translations/languages/es'
import sharp from 'sharp'
import { defaultSections, defaultSettings } from '@/features/website/content/defaults'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(dirname, '../../..')
const text = (name: string, label: string, required = true): Field => ({ name, label, type: 'text', required })
const common: Field[] = [text('eyebrow', 'Etiqueta superior'), { name: 'title', label: 'Título (admite saltos de línea)', type: 'textarea', required: true }, { name: 'description', label: 'Descripción', type: 'textarea' }]
const block = (slug: string, singular: string, fields: Field[]): Block => ({ slug, labels: { singular, plural: singular }, fields: [...common, ...fields] })
const blocks: Block[] = [
  block('hero', 'Portada', [text('buttonLabel', 'Texto del botón')]),
  block('services', 'Servicios', [{ name: 'services', label: 'Servicios', type: 'array', fields: [text('title', 'Nombre'), { name: 'description', label: 'Descripción', type: 'textarea', required: true }, text('tags', 'Especialidades')] }]),
  block('projects', 'Proyectos', [{ name: 'projects', label: 'Proyectos', type: 'array', fields: [text('title', 'Nombre'), text('category', 'Categoría'), { name: 'description', label: 'Detalle', type: 'textarea', required: true }, { name: 'tone', label: 'Estilo gráfico', type: 'select', required: true, defaultValue: 'peach', options: [{ label: 'Durazno', value: 'peach' }, { label: 'Violeta', value: 'purple' }, { label: 'Lima', value: 'lime' }] }, { name: 'image', label: 'Imagen (opcional, reemplaza la composición gráfica)', type: 'upload', relationTo: 'media' }] }]),
  block('about', 'Estudio / Nosotros', [{ name: 'stats', label: 'Datos destacados', type: 'array', maxRows: 4, fields: [text('value', 'Valor'), text('label', 'Descripción')] }]),
  block('faq', 'Preguntas frecuentes', [{ name: 'questions', label: 'Preguntas', type: 'array', fields: [text('question', 'Pregunta'), { name: 'answer', label: 'Respuesta', type: 'textarea', required: true }] }]),
  block('contact', 'Contacto', [text('buttonLabel', 'Texto del botón')]),
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
    { slug: 'users', labels: { singular: 'Usuario', plural: 'Usuarios' }, auth: true, admin: { useAsTitle: 'email' }, fields: [], access: { create: ({ req }) => Boolean(req.user), read: ({ req }) => Boolean(req.user), update: ({ req }) => Boolean(req.user), delete: ({ req }) => Boolean(req.user) } },
    { slug: 'media', labels: { singular: 'Imagen', plural: 'Biblioteca de imágenes' }, upload: { staticDir: path.resolve(root, 'media'), mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'], imageSizes: [{ name: 'card', width: 1200, height: 900, position: 'centre' }] }, access: { read: () => true }, fields: [text('alt', 'Descripción de la imagen (accesibilidad)')] },
  ],
  globals: [
    { slug: 'settings', label: 'Ajustes del sitio', access: { read: () => true }, fields: [text('brand', 'Marca'), text('tagline', 'Frase del pie de página'), { name: 'email', label: 'Email de contacto', type: 'email', required: true }, { name: 'accent', label: 'Color de acento (#RRGGBB)', type: 'text', required: true, validate: (value: unknown) => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? true : 'Ingresá un color hexadecimal de seis dígitos.' }, text('seoTitle', 'Título SEO'), { name: 'seoDescription', label: 'Descripción SEO', type: 'textarea', required: true }, { name: 'navigation', label: 'Menú', type: 'array', maxRows: 5, fields: [text('label', 'Texto'), { name: 'href', label: 'Destino (ancla, ruta o https://)', type: 'text', required: true, validate: (value: unknown) => typeof value === 'string' && /^(#[a-zA-Z0-9_-]+|\/(?!\/)|https:\/\/)/.test(value) ? true : 'Usá #seccion, /ruta o https://...' }] }] },
    { slug: 'home', label: 'Página de inicio', access: { read: ({ req }) => req.user ? true : { _status: { equals: 'published' } } }, versions: { drafts: true, max: 20 }, fields: [{ name: 'sections', label: 'Secciones (arrastrá para reordenar)', type: 'blocks', blocks }] },
  ],
  onInit: async (payload) => {
    const settings = await payload.findGlobal({ slug: 'settings' })
    if (!settings.brand) await payload.updateGlobal({ slug: 'settings', data: defaultSettings })
    const home = await payload.findGlobal({ slug: 'home' })
    if (!home.sections) await payload.updateGlobal({ slug: 'home', data: { sections: defaultSections, _status: 'published' } })
  },
})
