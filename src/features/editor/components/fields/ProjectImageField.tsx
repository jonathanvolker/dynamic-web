import type { Media } from '@/features/website/types'
import { useEffect, useRef, useState } from 'react'
import { uploadImage } from '../../lib/image'
import { Field } from './Field'

type Props = {
  title: string
  image?: Media
  onChange: (image: Media | undefined) => void
  onError: (message: string) => void
  label?: string
  removeLabel?: string
  fieldKey?: string
}

export function ProjectImageField({ title, image, onChange, onError, label = 'Imagen del proyecto', removeLabel = 'Usar composición original', fieldKey = 'image' }: Props) {
  const [uploading, setUploading] = useState(false)
  const controller = useRef<AbortController | null>(null)
  const latest = useRef({ onChange, onError, title })
  latest.current = { onChange, onError, title }
  useEffect(() => () => controller.current?.abort(), [])
  return (
    <>
      <label className="upload-label">
        {uploading ? 'Cargando…' : `↑ ${label}`}
        <input
          type="file"
          aria-label={label}
          disabled={uploading}
          accept="image/jpeg,image/png,image/webp"
          onChange={async event => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (!file) return
            const upload = new AbortController()
            controller.current = upload
            setUploading(true)
            try {
              const media = await uploadImage(file, upload.signal)
              if (!upload.signal.aborted) latest.current.onChange({ ...media, alt: latest.current.title || label })
            } catch (error) {
              if (!upload.signal.aborted) latest.current.onError(error instanceof Error ? error.message : 'No pudimos cargar la imagen.')
            } finally {
              if (!upload.signal.aborted) setUploading(false)
            }
          }}
        />
      </label>
      {image && (
        <>
          <img className="upload-preview" src={image.url} alt={image.alt || label} />
           <Field label="Texto alternativo" fieldKey={`${fieldKey}.alt`} value={image.alt || ''} onChange={alt => onChange({ ...image, alt })} />
           <button type="button" className="remove-row" disabled={uploading} onClick={() => onChange(undefined)}>{removeLabel}</button>
        </>
      )}
    </>
  )
}
