import 'server-only'
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { dataDirectory } from '@/server/storage'
import { postgresQuery, withPostgresTransaction } from '@/server/db/postgres'
import { MEDIA_PATH, mediaId, mediaIdPattern } from '@/features/website/media'
import type { SiteDocument } from '../types'
import { mediaIdsInDocument } from './media-ownership'
import { getEntitlements } from '@/features/billing/server/access'

const filePath = (id: string) => path.join(dataDirectory(), 'media', `${id}.webp`)
export const MAX_IMAGE_BYTES = 8_000_000
export const MAX_IMAGE_PIXELS = 40_000_000
const MAX_IMAGE_PROCESSING = 4
let activeImageProcessing = 0
const processingQueue: (() => void)[] = []
const ownerLocks = new Map<string, Promise<void>>()

class MediaLimitError extends Error {
  constructor(message: string) { super(message); this.name = 'MediaLimitError' }
}

async function withProcessingSlot<T>(task: () => Promise<T>) {
  if (activeImageProcessing >= MAX_IMAGE_PROCESSING) await new Promise<void>(resolve => processingQueue.push(resolve))
  activeImageProcessing++
  try { return await task() } finally {
    activeImageProcessing--
    processingQueue.shift()?.()
  }
}

async function withOwnerLock<T>(owner: string, task: () => Promise<T>) {
  const previous = ownerLocks.get(owner) || Promise.resolve()
  let release!: () => void
  const current = new Promise<void>(resolve => { release = resolve })
  ownerLocks.set(owner, current)
  await previous
  try { return await task() } finally {
    release()
    if (ownerLocks.get(owner) === current) ownerLocks.delete(owner)
  }
}

export async function storeImage(owner: string, file: File) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > MAX_IMAGE_BYTES || !file.size) {
    throw new Error('Elegí un JPG, PNG o WebP de hasta 8 MB.')
  }
  const image = await withProcessingSlot(async () => {
    const source = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: MAX_IMAGE_PIXELS })
    const metadata = await source.metadata()
    if (!['jpeg', 'png', 'webp'].includes(metadata.format || '')) throw new Error('Formato de imagen no válido.')
    if (!metadata.width || !metadata.height || metadata.width * metadata.height > MAX_IMAGE_PIXELS) {
      throw new MediaLimitError('La imagen supera el límite de 40 megapíxeles.')
    }
    return source.rotate().resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer()
  })
  const id = randomUUID()
  await mkdir(path.dirname(filePath(id)), { recursive: true })
  await writeFile(filePath(id), image, { flag: 'wx' })
  try {
    await withOwnerLock(owner, async () => {
      const quota = (await getEntitlements(owner)).plan.mediaStorageBytes
      await withPostgresTransaction(async client => {
        // Serialize quota checks across application instances, not just this process.
        await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [owner])
        const usage = await client.query<{ total: string | null }>(
          'SELECT SUM(size_bytes)::text AS total FROM platform_media WHERE owner_id = $1', [owner],
        )
        if (Number(usage.rows[0]?.total || 0) + image.byteLength > quota) {
          throw new MediaLimitError('Alcanzaste la cuota de imágenes de tu plan.')
        }
        await client.query(
          'INSERT INTO platform_media (id, owner_id, size_bytes, created_at) VALUES ($1, $2, $3, $4)',
          [id, owner, image.byteLength, new Date().toISOString()],
        )
      })
    })
  } catch (error) {
    await unlink(filePath(id))
    throw error
  }
  return { url: `${MEDIA_PATH}${id}`, alt: '' }
}

export async function readImage(id: string) {
  if (!mediaIdPattern.test(id)) return null
  const result = await postgresQuery('SELECT id FROM platform_media WHERE id = $1', [id])
  if (!result.rowCount) return null
  try { return await readFile(filePath(id)) } catch { return null }
}

export async function assertMediaOwnership(document: SiteDocument, owner: string) {
  const ids = mediaIdsInDocument(document)
  if (!ids.size) return
  const result = await postgresQuery<{ id: string }>(
    'SELECT id FROM platform_media WHERE owner_id = $1 AND id = ANY($2::text[])',
    [owner, [...ids]],
  )
  if (result.rowCount !== ids.size) throw new Error('Una imagen no pertenece a tu cuenta. Volvé a cargarla.')
}
