import { currentUser } from '@/features/auth/server/session'
import { storeImage } from '@/features/sites/server/media'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  // Next may expose its bind address (0.0.0.0) in request.url. Host is the
  // browser-facing authority, also preserved by our reverse proxy.
  const host = request.headers.get('host')
  const origin = request.headers.get('origin')
  if (!host || !origin || ![`https://${host}`, `http://${host}`].includes(origin)) {
    return Response.json({ error: 'Origen no permitido.' }, { status: 403 })
  }
  const user = await currentUser()
  if (!user) return Response.json({ error: 'Iniciá sesión para cargar imágenes.' }, { status: 401 })
  if (Number(request.headers.get('content-length')) > 9_000_000) {
    return Response.json({ error: 'La imagen supera el límite de 8 MB.' }, { status: 413 })
  }
  try {
    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File)) return Response.json({ error: 'Elegí una imagen.' }, { status: 400 })
    return Response.json(await storeImage(user.id, file), { status: 201 })
  } catch {
    return Response.json({ error: 'No pudimos cargar la imagen. Usá JPG, PNG o WebP de hasta 8 MB.' }, { status: 400 })
  }
}
