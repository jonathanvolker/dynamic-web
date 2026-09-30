import type { Media } from '@/features/website/types'
import { imageData } from '../../lib/image'
import { Field } from './Field'

type Props = {
  title: string
  image?: Media
  onChange: (image: Media | undefined) => void
  onError: (message: string) => void
}

export function ProjectImageField({ title, image, onChange, onError }: Props) {
  return (
    <>
      <label className="upload-label">
        ↑ Subir imagen
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={async event => {
            const file = event.target.files?.[0]
            if (!file) return
            try {
              onChange({ url: await imageData(file), alt: title || 'Proyecto' })
            } catch (error) {
              onError(error instanceof Error ? error.message : 'No pudimos cargar la imagen.')
            }
          }}
        />
      </label>
      {image && (
        <>
          <img className="upload-preview" src={image.url} alt="Imagen del proyecto" />
          <Field label="Texto alternativo" value={image.alt || ''} onChange={alt => onChange({ ...image, alt })} />
          <button className="remove-row" onClick={() => onChange(undefined)}>Usar composición original</button>
        </>
      )}
    </>
  )
}
