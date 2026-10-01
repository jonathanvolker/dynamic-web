import { useId } from 'react'

type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
}

export function Field({ label, value, onChange, multiline = false }: Props) {
  const id = useId()
  return (
    <div className="editor-field">
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea id={id} value={value} onChange={event => onChange(event.target.value)} rows={3} />
      ) : (
        <input id={id} value={value} onChange={event => onChange(event.target.value)} />
      )}
    </div>
  )
}
