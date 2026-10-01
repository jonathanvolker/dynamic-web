import Link from 'next/link'
import { families, templates } from '../registry'
import { TemplateCard } from './TemplateCard'

export function TemplateGallery() {
  return (
    <div className="platform template-gallery">
      <header className="p-header">
        <Link className="p-logo" href="/">forma<span>✳</span><small>web builder</small></Link>
        <nav aria-label="Navegación de plantillas"><Link className="text-link" href="/">← Inicio</Link><Link className="p-button secondary" href="/login">Iniciar sesión ↗</Link></nav>
      </header>
      <main className="catalog-main">
        <div className="catalog-heading"><span className="p-kicker">UN BUEN PUNTO DE PARTIDA</span><h1>Distintos estilos.<br /><em>Una web muy tuya.</em></h1><p>Elegí una familia visual y una plantilla para tu proyecto. Personalizá su composición, imágenes, tipografía y colores desde el editor.</p><span className="catalog-count">{families.length} familias visuales · {templates.length} plantillas · Vista pública</span></div>
        {families.map(family => <section className={`catalog-family family-${family.id}`} key={family.id} aria-labelledby={`family-${family.id}`}>
          <div className="catalog-family-heading"><span className="p-kicker">FAMILIA VISUAL</span><h2 id={`family-${family.id}`}>{family.name}</h2><p>{family.description}</p></div>
          <div className={`catalog-grid family-${family.id}${templates.filter(template => template.familyId === family.id).length === 1 ? ' single-template' : ''}`}>{templates.filter(template => template.familyId === family.id).map(template => <TemplateCard key={template.id} template={template} />)}</div>
        </section>)}
        <div className="catalog-note"><span>✳</span><p>Una plantilla es el comienzo. Podés cambiar colores, editar el contenido y combinar secciones desde el constructor.</p></div>
      </main>
      <footer className="landing-footer">Forma · Tu lugar en internet.<Link href="/">Volver al inicio ↗</Link></footer>
    </div>
  )
}
