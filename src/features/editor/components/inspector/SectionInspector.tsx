import type { EditorController } from '../../hooks/use-site-editor'
import { Field } from '../fields/Field'
import { ArrayField } from '../fields/ArrayField'
import { LinkField } from '../fields/LinkField'
import { ProjectImageField } from '../fields/ProjectImageField'
import type { Section } from '@/features/website/types'
import { blockDefinitions } from '../../config/blocks'
import { useState } from 'react'
import { Modal } from '@/features/platform/components/Modal'
import SiteView from '@/features/website/components/SiteView'

export function SectionInspector({ editor }: { editor: EditorController }) {
  const { section } = editor
  const [confirmRemove, setConfirmRemove] = useState(false)
  if (!section) return null
  if (editor.sectionLocked) return <p className="inspector-locked">Esta sección pertenece a tu contenido existente. Tu plan actual no permite editarla ni duplicarla. <a href="/planes">Mejorar plan ↗</a></p>
  const rows = blockDefinitions[section.blockType].rows
  return (
    <>
      <div className="section-live-preview" aria-label="Vista previa en vivo de la sección">
        <span>VISTA PREVIA DE ESTA SECCIÓN</span>
        <div><SiteView settings={editor.document.settings} sections={[section]} familyId={editor.document.familyId} preview /></div>
      </div>
      <Field label="Etiqueta superior" fieldKey="eyebrow" value={section.eyebrow} onChange={value => editor.changeSection('eyebrow', value)} />
      <Field label="Título" fieldKey="title" value={section.title} multiline onChange={value => editor.changeSection('title', value)} />
      <Field label="Descripción" fieldKey="description" value={section.description || ''} multiline onChange={value => editor.changeSection('description', value)} />
      {['hero', 'contact', 'cta'].includes(section.blockType) && (
        <>
          <Field label="Texto del botón" value={section.buttonLabel || ''} onChange={value => editor.changeSection('buttonLabel', value)} />
          <LinkField label="Destino del botón" value={section.buttonHref ?? (section.blockType === 'hero' ? '#contact' : `mailto:${editor.document.settings.email}`)} sections={editor.document.sections} onChange={value => editor.changeSection('buttonHref', value)} />
        </>
      )}
      {section.blockType === 'hero' && <label className="editor-field">Composición de portada
        <select value={section.heroLayout || 'split'} onChange={event => editor.changeSection('heroLayout', event.target.value as Section['heroLayout'])}>
          <option value="split">Dividida · texto e imagen</option><option value="centered">Centrada · imagen debajo</option><option value="cover">Inmersiva · imagen de fondo</option>
        </select>
      </label>}
      {['hero', 'about', 'textImage'].includes(section.blockType) && <>
        <ProjectImageField label="Imagen de la sección" title={section.title} image={section.image} onChange={image => editor.changeSection('image', image)} onError={editor.setError} />
        {section.image && <label className="editor-field">Encuadre de imagen
          <select value={section.imagePosition || 'center'} onChange={event => editor.changeSection('imagePosition', event.target.value)}>
            <option value="center">Centro</option><option value="top">Arriba</option><option value="bottom">Abajo</option>
          </select>
        </label>}
      </>}
      {section.blockType === 'textImage' && <label className="editor-field">Ubicación de imagen
        <select value={section.textImageLayout || 'image-right'} onChange={event => editor.changeSection('textImageLayout', event.target.value as Section['textImageLayout'])}>
          <option value="image-right">Derecha</option><option value="image-left">Izquierda</option>
        </select>
      </label>}
      {section.blockType === 'video' && <>
        <label className="editor-field">Proveedor<select value={section.videoProvider || 'youtube'} onChange={event => editor.changeSection('videoProvider', event.target.value)}><option value="youtube">YouTube</option><option value="vimeo">Vimeo</option></select></label>
        <Field label="ID del video" value={section.videoId || ''} onChange={value => editor.changeSection('videoId', value)} />
        <Field label="Título accesible del video" value={section.videoTitle || ''} onChange={value => editor.changeSection('videoTitle', value)} />
      </>}
      {['form', 'newsletter'].includes(section.blockType) && <>
        <Field label="Texto del botón" value={section.formSubmitLabel || ''} onChange={value => editor.changeSection('formSubmitLabel', value)} />
        <Field label="Mensaje de éxito" value={section.formSuccessMessage || ''} onChange={value => editor.changeSection('formSuccessMessage', value)} />
      </>}
      {section.blockType === 'newsletter' && <><Field label="Etiqueta del email" value={section.newsletterLabel || ''} onChange={value => editor.changeSection('newsletterLabel', value)} /><Field label="Texto de consentimiento" value={section.newsletterConsent || ''} onChange={value => editor.changeSection('newsletterConsent', value)} /></>}
      {section.blockType === 'hours' && <><Field label="Dirección" value={section.address || ''} onChange={value => editor.changeSection('address', value)} /><Field label="Teléfono" value={section.phone || ''} onChange={value => editor.changeSection('phone', value)} /><Field label="Enlace de mapa" value={section.mapHref || ''} onChange={value => editor.changeSection('mapHref', value)} /></>}
      {rows && <ArrayField name={rows} editor={editor} />}
      <div className="section-controls">
        <p className="inspector-note">Dirección estable: #{section.anchor}</p>
        <button type="button" className="add-row" disabled={editor.document.sections.length >= 30} onClick={editor.duplicate}>Duplicar sección</button>
        <button type="button" className="remove-row section-delete-button" disabled={editor.document.sections.length <= 1} onClick={() => setConfirmRemove(true)} aria-label="Eliminar sección">🗑 Eliminar sección</button>
      </div>
      <Modal open={confirmRemove} title="¿Eliminar esta sección?" description="La sección desaparecerá de tu borrador. Podés recuperarla inmediatamente con Deshacer." confirmLabel="Eliminar sección" tone="danger" onConfirm={() => { editor.remove(); setConfirmRemove(false) }} onCancel={() => setConfirmRemove(false)} />
    </>
  )
}
