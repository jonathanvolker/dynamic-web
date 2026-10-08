import type { EditorController } from '../../hooks/use-site-editor'
import { Field } from '../fields/Field'
import { ThemeInspector } from './ThemeInspector'
import { DesignInspector } from './DesignInspector'
import { ProjectImageField } from '../fields/ProjectImageField'
import { LinkField } from '../fields/LinkField'

export function SettingsInspector({ editor }: { editor: EditorController }) {
  const { settings } = editor.document
  return (
    <>
      <Field label="Nombre de marca" fieldKey="brand" value={settings.brand} onChange={value => editor.changeSetting('brand', value)} />
      <ProjectImageField label="Logo de marca" title={settings.brand} image={settings.logo} removeLabel="Usar nombre de marca" onChange={image => editor.changeSetting('logo', image)} onError={editor.setError} />
      <Field label="Frase del pie de página" fieldKey="tagline" value={settings.tagline} onChange={value => editor.changeSetting('tagline', value)} />
      <Field label="Email de contacto" fieldKey="email" value={settings.email} onChange={value => editor.changeSetting('email', value)} />
      <ThemeInspector editor={editor} />
      <DesignInspector editor={editor} />
      <div className="inspector-heading"><strong>Botón del menú</strong></div>
       <Field label="Texto del botón del menú" fieldKey="headerButton.label" value={settings.headerButton?.label ?? 'Hablemos'} onChange={label => editor.changeSetting('headerButton', { label, href: settings.headerButton?.href ?? '#contact' })} />
      <LinkField label="Destino del botón del menú" value={settings.headerButton?.href ?? '#contact'} sections={editor.document.sections} onChange={href => editor.changeSetting('headerButton', { label: settings.headerButton?.label ?? 'Hablemos', href })} />
      <div className="inspector-heading"><strong>Buscadores / SEO</strong></div>
       <Field label="Título de la web" fieldKey="seoTitle" value={settings.seoTitle} onChange={value => editor.changeSetting('seoTitle', value)} />
       <Field label="Descripción" fieldKey="seoDescription" value={settings.seoDescription} multiline onChange={value => editor.changeSetting('seoDescription', value)} />
      <div className="inspector-heading"><strong>Menú de navegación</strong></div>
      {settings.navigation.map((item, index) => (
        <div className="nav-row" key={index}>
           <Field label="Nombre" fieldKey={`navigation.${index}.label`} value={item.label} onChange={value => editor.change(next => { next.settings.navigation[index].label = value })} />
           <LinkField label="Destino" value={item.href} sections={editor.document.sections} onChange={value => editor.change(next => { next.settings.navigation[index].href = value })} />
           <button type="button" className="remove-row" onClick={() => editor.change(next => { next.settings.navigation.splice(index, 1) })}>Quitar enlace</button>
        </div>
      ))}
       <button type="button" className="add-row" disabled={settings.navigation.length >= 5} onClick={() => editor.change(next => next.settings.navigation.push({ label: 'Nuevo enlace', href: '#contact' }))}>
        + Agregar enlace
      </button>
      <p className="inspector-note">Elegí una sección de la lista. Su dirección se conserva al reordenar el sitio.</p>
    </>
  )
}
