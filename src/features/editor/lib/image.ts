/** Normalize uploads client-side before persisting the site document. */
export async function imageData(file: File): Promise<string> {
  const supported = ['image/jpeg', 'image/png', 'image/webp']
  if (!supported.includes(file.type) || file.size > 8_000_000) {
    throw new Error('Elegí un JPG, PNG o WebP de hasta 8 MB.')
  }

  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height))
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const context = canvas.getContext('2d')

  if (!context) {
    bitmap.close()
    throw new Error('No pudimos procesar la imagen.')
  }

  context.fillStyle = '#f8f7f2'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', .8)
}
