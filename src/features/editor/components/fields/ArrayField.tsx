import type { Media } from '@/features/website/types'
import { rowFields, rowLabels, type RowKey } from '../../config/blocks'
import type { EditorController } from '../../hooks/use-site-editor'
import { Field } from './Field'
import { ProjectImageField } from './ProjectImageField'

export function ArrayField({ name, editor }: { name: RowKey; editor: EditorController }) {
  if (!editor.section) return null
  const items = (editor.section[name] || []) as unknown as Record<string, unknown>[]

  function updateRow(index: number, field: string, value: unknown) {
    editor.changeSection(name, items.map((row, i) => i === index ? { ...row, [field]: value } : row))
  }

  function addRow() {
    const row = Object.fromEntries(rowFields[name].map(field => [
      field.name,
      field.name === 'title' ? 'Nuevo elemento' : field.name === 'question' ? 'Nueva pregunta' : '',
    ]))
    editor.changeSection(name, [...items, name === 'projects' ? { ...row, tone: 'peach' } : row])
  }

  return (
    <div className="row-editor">
      <div className="inspector-heading"><strong>{rowLabels[name]}</strong><span>{items.length}</span></div>
      {items.map((row, index) => (
        <details className="row-detail" key={index} open={items.length === 1 || undefined}>
          <summary>{String(row.title || row.question || row.label || `Elemento ${index + 1}`)}<span>⌄</span></summary>
          <div className="row-fields">
            {rowFields[name].map(field => (
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
                <ProjectImageField
                  title={String(row.title || '')}
                  image={row.image as Media | undefined}
                  onChange={image => updateRow(index, 'image', image)}
                  onError={editor.setError}
                />
              </>
            )}
            <button className="remove-row" onClick={() => editor.changeSection(name, items.filter((_, i) => i !== index))}>
              Eliminar elemento
            </button>
          </div>
        </details>
      ))}
      <button className="add-row" disabled={items.length >= 20} onClick={addRow}>+ Agregar elemento</button>
    </div>
  )
}
