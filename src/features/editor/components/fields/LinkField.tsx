import type { Section } from '@/features/website/types'
import { isSafeHref, sectionAnchors } from '@/features/website/links'
import { Field } from './Field'

export function LinkField({ label, value, optional = false, sections, onChange, fieldKey }: {
  label: string; value: string; optional?: boolean; sections: Section[]; onChange: (value: string) => void; fieldKey?: string
}) {
  const linkableSections = sections.filter(section => section.blockType !== 'footer')
  const linkableAnchors = sectionAnchors(linkableSections)
  const missing = value.startsWith('#') && value !== '#main' && !linkableAnchors.includes(value.slice(1))
  return <div className="link-field">
    <label className="editor-field">{label} · sección
      <select value={linkableAnchors.includes(value.slice(1)) && value.startsWith('#') ? value : ''} onChange={event => { if (event.target.value) onChange(event.target.value) }}>
        <option value="">Elegir una sección…</option>
        {linkableSections.map((section, index) => <option key={linkableAnchors[index]} value={`#${linkableAnchors[index]}`}>{section.title.split('\n')[0].slice(0, 45)} · #{linkableAnchors[index]}</option>)}
      </select>
    </label>
    <Field label={`${label} · enlace`} fieldKey={fieldKey} value={value} onChange={onChange} />
    <p className="inspector-note">También: https://…, mailto:…, tel:… o https://wa.me/…</p>
    {missing && <p className="field-warning" role="alert">La sección de destino no existe. El enlace no se mostrará en la web.</p>}
    {value && !isSafeHref(value) && <p className="field-warning" role="alert">Ingresá un destino válido. El botón o enlace no se mostrará hasta corregirlo.</p>}
  </div>
}
