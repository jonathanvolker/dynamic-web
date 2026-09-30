import { useEffect, useState } from 'react'

type Props = { label: string; value: string; onChange: (color: string) => void }

export function ColorField({ label, value, onChange }: Props) {
  const [hex, setHex] = useState(value)
  useEffect(() => { setHex(value) }, [value])

  return (
    <label className="editor-field">
      {label}
      <div className="color-input">
        <input type="color" aria-label={label} value={value} onChange={event => onChange(event.target.value)} />
        <input
          className="color-hex"
          aria-label={`${label} en hexadecimal`}
          value={hex}
          maxLength={7}
          spellCheck={false}
          onChange={event => {
            const next = event.target.value
            setHex(next)
            if (/^#[a-f0-9]{6}$/i.test(next)) onChange(next.toLowerCase())
          }}
          onBlur={() => setHex(value)}
        />
      </div>
    </label>
  )
}
