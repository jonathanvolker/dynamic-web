import type { EditorController } from '../../hooks/use-site-editor'
import { Field } from '../fields/Field'
import { ThemeInspector } from './ThemeInspector'

export function SettingsInspector({ editor }: { editor: EditorController }) {
  const { settings } = editor.document
  return (
    <>
      <Field label="Nombre de marca" value={settings.brand} onChange={value => editor.changeSetting('brand', value)} />
      <Field label="Frase del pie de página" value={settings.tagline} onChange={value => editor.changeSetting('tagline', value)} />
      <Field label="Email de contacto" value={settings.email} onChange={value => editor.changeSetting('email', value)} />
      <ThemeInspector editor={editor} />
      <div className="inspector-heading"><strong>Buscadores / SEO</strong></div>
      <Field label="Título de la web" value={settings.seoTitle} onChange={value => editor.changeSetting('seoTitle', value)} />
      <Field label="Descripción" value={settings.seoDescription} multiline onChange={value => editor.changeSetting('seoDescription', value)} />
      <div className="inspector-heading"><strong>Menú de navegación</strong></div>
      {settings.navigation.map((item, index) => (
        <div className="nav-row" key={index}>
          <Field label="Nombre" value={item.label} onChange={value => editor.change(next => { next.settings.navigation[index].label = value })} />
          <Field label="Destino" value={item.href} onChange={value => editor.change(next => { next.settings.navigation[index].href = value })} />
          <button className="remove-row" onClick={() => editor.change(next => { next.settings.navigation.splice(index, 1) })}>Quitar enlace</button>
        </div>
      ))}
      <button className="add-row" disabled={settings.navigation.length >= 5} onClick={() => editor.change(next => next.settings.navigation.push({ label: 'Nuevo enlace', href: '#contact' }))}>
        + Agregar enlace
      </button>
      <p className="inspector-note">Destinos: #hero, #services, #projects, #about, #faq y #contact. Si repetís una sección, usá -2, -3, etc.</p>
    </>
  )
}
