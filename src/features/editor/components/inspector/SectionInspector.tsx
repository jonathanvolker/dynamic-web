import type { EditorController } from '../../hooks/use-site-editor'
import { Field } from '../fields/Field'
import { ArrayField } from '../fields/ArrayField'

export function SectionInspector({ editor }: { editor: EditorController }) {
  const { section } = editor
  if (!section) return null
  return (
    <>
      <Field label="Etiqueta superior" value={section.eyebrow} onChange={value => editor.changeSection('eyebrow', value)} />
      <Field label="Título" value={section.title} multiline onChange={value => editor.changeSection('title', value)} />
      <Field label="Descripción" value={section.description || ''} multiline onChange={value => editor.changeSection('description', value)} />
      {['hero', 'contact'].includes(section.blockType) && (
        <Field label="Texto del botón" value={section.buttonLabel || ''} onChange={value => editor.changeSection('buttonLabel', value)} />
      )}
      {section.blockType === 'services' && <ArrayField name="services" editor={editor} />}
      {section.blockType === 'projects' && <ArrayField name="projects" editor={editor} />}
      {section.blockType === 'about' && <ArrayField name="stats" editor={editor} />}
      {section.blockType === 'faq' && <ArrayField name="questions" editor={editor} />}
      <div className="section-controls">
        <button className="add-row" disabled={editor.document.sections.length >= 30} onClick={editor.duplicate}>Duplicar sección</button>
        <button className="remove-row" disabled={editor.document.sections.length <= 1} onClick={editor.remove}>Eliminar sección</button>
      </div>
    </>
  )
}
