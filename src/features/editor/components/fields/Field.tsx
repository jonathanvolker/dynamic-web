import { useId } from 'react'

type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
  fieldKey?: string
}

export function Field({ label, value, onChange, multiline = false, fieldKey = label }: Props) {
  const id = useId()
  return (
    <div className="editor-field" data-editor-field={fieldKey}>
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea id={id} value={value} onChange={event => onChange(event.target.value)} rows={3} />
      ) : (
        <input id={id} value={value} onChange={event => onChange(event.target.value)} />
      )}
    </div>
  )
}
