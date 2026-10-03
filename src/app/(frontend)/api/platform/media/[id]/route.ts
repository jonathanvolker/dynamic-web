import { readImage } from '@/features/sites/server/media'

export const runtime = 'nodejs'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const image = await readImage((await params).id)
  if (!image) return new Response(null, { status: 404 })
  // Uploaded assets have public, opaque URLs so the same image works on published sites.
  return new Response(new Uint8Array(image), {
    headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' },
  })
}
