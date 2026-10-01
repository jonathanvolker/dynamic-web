import type { EditorController } from '../../hooks/use-site-editor'
import { Field } from '../fields/Field'
import { ArrayField } from '../fields/ArrayField'
import { LinkField } from '../fields/LinkField'
import { ProjectImageField } from '../fields/ProjectImageField'
import type { Section } from '@/features/website/types'
import { blockDefinitions } from '../../config/blocks'
import { useState } from 'react'
import { Modal } from '@/features/platform/components/Modal'

export function SectionInspector({ editor }: { editor: EditorController }) {
  const { section } = editor
  const [confirmRemove, setConfirmRemove] = useState(false)
  if (!section) return null
  const rows = blockDefinitions[section.blockType].rows
  return (
    <>
      <Field label="Etiqueta superior" value={section.eyebrow} onChange={value => editor.changeSection('eyebrow', value)} />
      <Field label="Título" value={section.title} multiline onChange={value => editor.changeSection('title', value)} />
      <Field label="Descripción" value={section.description || ''} multiline onChange={value => editor.changeSection('description', value)} />
      {['hero', 'contact'].includes(section.blockType) && (
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
      {['hero', 'about'].includes(section.blockType) && <>
        <ProjectImageField label="Imagen de la sección" title={section.title} image={section.image} onChange={image => editor.changeSection('image', image)} onError={editor.setError} />
        {section.image && <label className="editor-field">Encuadre de imagen
          <select value={section.imagePosition || 'center'} onChange={event => editor.changeSection('imagePosition', event.target.value)}>
            <option value="center">Centro</option><option value="top">Arriba</option><option value="bottom">Abajo</option>
          </select>
        </label>}
      </>}
      {rows && <ArrayField name={rows} editor={editor} />}
      <div className="section-controls">
        <p className="inspector-note">Dirección estable: #{section.anchor}</p>
        <button className="add-row" disabled={editor.document.sections.length >= 30} onClick={editor.duplicate}>Duplicar sección</button>
        <button className="remove-row" disabled={editor.document.sections.length <= 1} onClick={() => setConfirmRemove(true)}>Eliminar sección</button>
      </div>
      <Modal open={confirmRemove} title="¿Eliminar esta sección?" description="La sección desaparecerá de tu borrador. Podés recuperarla inmediatamente con Deshacer." confirmLabel="Eliminar sección" tone="danger" onConfirm={() => { editor.remove(); setConfirmRemove(false) }} onCancel={() => setConfirmRemove(false)} />
    </>
  )
}
