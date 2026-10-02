import type { Media } from '@/features/website/types'
import { rowFields, rowLabels, type RowKey } from '../../config/blocks'
import type { EditorController } from '../../hooks/use-site-editor'
import { Field } from './Field'
import { ProjectImageField } from './ProjectImageField'
import { LinkField } from './LinkField'

export function ArrayField({ name, editor }: { name: RowKey; editor: EditorController }) {
  if (!editor.section) return null
  const items = (editor.section[name] || []) as unknown as Record<string, unknown>[]

  function updateRow(index: number, field: string, value: unknown) {
    editor.changeSection(name, items.map((row, i) => i === index ? { ...row, [field]: value } : row))
  }

  function addRow() {
    const row = Object.fromEntries(rowFields[name].map(field => [
      field.name,
       field.name === 'title' ? 'Nuevo elemento' : field.name === 'question' ? 'Nueva pregunta' : field.name === 'buttonHref' ? '#contact' : field.name === 'type' ? 'text' : '',
    ]))
    editor.changeSection(name, [...items, name === 'projects' ? { ...row, tone: 'peach' } : row])
  }

  return (
    <div className="row-editor">
      <div className="inspector-heading"><strong>{rowLabels[name]}</strong><span>{items.length}</span></div>
      {items.map((row, index) => (
        <details className="row-detail" key={index} open={items.length === 1 || undefined}>
          <summary>{String(row.title || row.question || row.name || row.label || `Elemento ${index + 1}`)}<span>⌄</span></summary>
          <div className="row-fields">
            {rowFields[name].map(field => field.link ? (
              <LinkField key={field.name} label={field.label} value={String(row[field.name] || '')} optional={field.optional} sections={editor.document.sections} onChange={value => updateRow(index, field.name, value)} />
            ) : (
              <Field
                key={field.name}
                label={field.label}
                value={String(row[field.name] || '')}
                multiline={field.multiline}
                onChange={value => updateRow(index, field.name, value)}
              />
            ))}
            {name === 'projects' && (
              <>
                <label className="editor-field">
                  Composición
                  <select value={String(row.tone)} onChange={event => updateRow(index, 'tone', event.target.value)}>
                    <option value="peach">Durazno</option><option value="purple">Violeta</option><option value="lime">Lima</option>
                  </select>
                </label>
              </>
            )}
            {name === 'formFields' && <>
              <label className="editor-field">Tipo de campo
                <select value={String(row.type || 'text')} onChange={event => updateRow(index, 'type', event.target.value)}><option value="text">Texto</option><option value="email">Email</option><option value="tel">Teléfono</option><option value="textarea">Texto largo</option></select>
              </label>
              <label className="editor-checkbox"><input type="checkbox" checked={Boolean(row.required)} onChange={event => updateRow(index, 'required', event.target.checked)} />Campo obligatorio</label>
            </>}
             {['projects', 'gallery', 'logos', 'team'].includes(name) && <ProjectImageField
               label={name === 'gallery' ? 'Imagen de la galería' : name === 'logos' ? 'Imagen del logo' : name === 'team' ? 'Imagen de la persona' : 'Imagen del proyecto'} title={String(row.title || row.name || '')}
               image={row.image as Media | undefined} onChange={image => updateRow(index, 'image', image)} onError={editor.setError}
               removeLabel={name === 'gallery' || name === 'logos' || name === 'team' ? 'Quitar imagen' : undefined}
             />}
            {name === 'plans' && <label className="editor-checkbox"><input type="checkbox" checked={Boolean(row.featured)} onChange={event => updateRow(index, 'featured', event.target.checked)} />Destacar este plan</label>}
             <button type="button" className="remove-row" onClick={() => editor.changeSection(name, items.filter((_, i) => i !== index))}>
              Eliminar elemento
            </button>
          </div>
        </details>
      ))}
       <button type="button" className="add-row" disabled={items.length >= 20} onClick={addRow}>+ Agregar elemento</button>
    </div>
  )
}
