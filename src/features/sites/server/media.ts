import 'server-only'
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { dataDirectory, db } from '@/server/db/sqlite'
import { MEDIA_PATH, mediaId, mediaIdPattern } from '@/features/website/media'
import type { SiteDocument } from '../types'
import { mediaIdsInDocument } from './media-ownership'

const filePath = (id: string) => path.join(dataDirectory(), 'media', `${id}.webp`)

export async function storeImage(owner: string, file: File) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8_000_000 || !file.size) {
    throw new Error('Elegí un JPG, PNG o WebP de hasta 8 MB.')
  }
  const source = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 40_000_000 })
  const metadata = await source.metadata()
  if (!['jpeg', 'png', 'webp'].includes(metadata.format || '')) throw new Error('Formato de imagen no válido.')
  const image = await source.rotate().resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer()
  const id = randomUUID()
  await mkdir(path.dirname(filePath(id)), { recursive: true })
  await writeFile(filePath(id), image, { flag: 'wx' })
  try {
    db().prepare('INSERT INTO media (id, owner_id, created_at) VALUES (?, ?, ?)').run(id, owner, new Date().toISOString())
  } catch (error) {
    await unlink(filePath(id))
    throw error
  }
  return { url: `${MEDIA_PATH}${id}`, alt: '' }
}

export async function readImage(id: string) {
  if (!mediaIdPattern.test(id) || !db().prepare('SELECT id FROM media WHERE id = ?').get(id)) return null
  try { return await readFile(filePath(id)) } catch { return null }
}

export function assertMediaOwnership(document: SiteDocument, owner: string) {
  const ids = mediaIdsInDocument(document)
  const query = db().prepare('SELECT id FROM media WHERE id = ? AND owner_id = ?')
  for (const id of ids) {
    if (!query.get(id, owner)) throw new Error('Una imagen no pertenece a tu cuenta. Volvé a cargarla.')
  }
}
