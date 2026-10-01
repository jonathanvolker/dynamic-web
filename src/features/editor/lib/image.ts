import type { Media } from '@/features/website/types'

/** Store media independently of the site JSON, preserving transparent logos. */
export async function uploadImage(file: File, signal: AbortSignal): Promise<Media> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8_000_000) {
    throw new Error('Elegí un JPG, PNG o WebP de hasta 8 MB.')
  }
  const form = new FormData()
  form.append('file', file)
  const response = await fetch('/api/platform/media', { method: 'POST', body: form, signal })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'No pudimos cargar la imagen.')
  return result as Media
}
