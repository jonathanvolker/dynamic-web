import Link from 'next/link'
import { templates } from '../registry'
import { TemplateCard } from './TemplateCard'

export function TemplateGallery() {
  return (
    <div className="platform template-gallery">
      <header className="p-header">
        <Link className="p-logo" href="/">forma<span>✳</span><small>web builder</small></Link>
        <nav aria-label="Navegación de plantillas"><Link className="text-link" href="/">← Inicio</Link><Link className="p-button secondary" href="/login">Iniciar sesión ↗</Link></nav>
      </header>
      <main className="catalog-main">
        <div className="catalog-heading"><span className="p-kicker">UN BUEN PUNTO DE PARTIDA</span><h1>Distintas ideas.<br /><em>Tu propia web.</em></h1><p>Explorá cada diseño completo sin crear una cuenta. Después, elegí una base y hacela tuya con tus textos, imágenes y colores.</p><span className="catalog-count">{templates.length} plantillas · Vista pública · Personalizables</span></div>
        <div className="catalog-grid">{templates.map(template => <TemplateCard key={template.id} template={template} />)}</div>
        <div className="catalog-note"><span>✳</span><p>Una plantilla es el comienzo. Podés cambiar colores, editar el contenido y combinar secciones desde el constructor.</p></div>
      </main>
      <footer className="landing-footer">Forma · Tu lugar en internet.<Link href="/">Volver al inicio ↗</Link></footer>
    </div>
  )
}
