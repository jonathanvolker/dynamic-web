import type { Media } from './types'
import { templatePhotos } from './content/media'

export const MEDIA_PATH = '/api/platform/media/'
export const mediaIdPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/

export function mediaId(url: string) {
  const id = url.startsWith(MEDIA_PATH) ? url.slice(MEDIA_PATH.length) : ''
  return mediaIdPattern.test(id) ? id : undefined
}

export function isValidMedia(value: unknown): value is Media {
  if (!value || typeof value !== 'object') return false
  const image = value as Media
  return typeof image.alt === 'string' && image.alt.length <= 500
    && typeof image.url === 'string' && image.url.length <= 2_000_000
    && (Boolean(mediaId(image.url)) || Object.values(templatePhotos).some(photo => photo.url === image.url)
      || /^data:image\/(jpeg|png|webp);base64,[a-z0-9+/=]+$/i.test(image.url))
}
