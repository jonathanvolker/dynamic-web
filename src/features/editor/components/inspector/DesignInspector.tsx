import type { SiteDesign } from '@/features/website/types'
import type { EditorController } from '../../hooks/use-site-editor'

const fontOptions = [
  ['manrope', 'Manrope · geométrica'], ['dm-sans', 'DM Sans · sans serif'],
  ['serif', 'Georgia · editorial'], ['system', 'Sistema · nativa'],
]
const fields = [
  { key: 'headingFont', label: 'Tipografía de títulos', options: fontOptions },
  { key: 'bodyFont', label: 'Tipografía de textos', options: fontOptions },
  { key: 'width', label: 'Ancho del contenido', options: [['narrow', 'Estrecho'], ['standard', 'Estándar'], ['wide', 'Amplio']] },
  { key: 'spacing', label: 'Espaciado entre secciones', options: [['compact', 'Compacto'], ['standard', 'Estándar'], ['airy', 'Aireado']] },
] as const

export function DesignInspector({ editor }: { editor: EditorController }) {
  const design = editor.document.settings.design || {}
  function update(key: keyof SiteDesign, value: string) {
    editor.change(next => {
      const current = next.settings.design || {}
      if (value) Object.assign(current, { [key]: value })
      else delete current[key]
      next.settings.design = current
    })
  }
  return <>
    <div className="inspector-heading"><strong>Tipografía y composición</strong></div>
    {fields.map(field => <label className="editor-field" data-editor-field={`design.${field.key}`} key={field.key}>{field.label}
      <select value={design[field.key] || ''} onChange={event => update(field.key, event.target.value)}>
        <option value="">Original de la plantilla</option>
        {field.options.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
      </select>
    </label>)}
  </>
}
