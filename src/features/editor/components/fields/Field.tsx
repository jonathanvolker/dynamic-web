type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
}

export function Field({ label, value, onChange, multiline = false }: Props) {
  return (
    <label className="editor-field">
      {label}
      {multiline ? (
        <textarea value={value} onChange={event => onChange(event.target.value)} rows={3} />
      ) : (
        <input value={value} onChange={event => onChange(event.target.value)} />
      )}
    </label>
  )
}
