import 'server-only'
import { randomUUID } from 'node:crypto'
import { db } from '@/server/db/sqlite'
import { getTemplate } from '@/features/templates/registry'
import type { Site, SiteDocument } from '../types'
import { migrateDocument } from '../document'

function deserialize(row: Record<string, unknown> | undefined): Site | null {
  if (!row) return null
  return {
    ...row,
    draft: migrateDocument(JSON.parse(row.draft as string)),
    published: row.published ? migrateDocument(JSON.parse(row.published as string)) : null,
  } as Site
}

export function listSites(owner: string) {
  return db().prepare('SELECT * FROM sites WHERE owner_id = ? ORDER BY updated_at DESC')
    .all(owner).map(row => deserialize(row)!)
}

export function findSite(id: string, owner: string) {
  return deserialize(db().prepare('SELECT * FROM sites WHERE id = ? AND owner_id = ?').get(id, owner))
}

export function publicSite(slug: string) {
  return deserialize(db().prepare('SELECT * FROM sites WHERE slug = ? AND published IS NOT NULL').get(slug))
}

export function createSite(owner: string, name: string, template: string) {
  const id = randomUUID()
  const baseSlug = name.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'mi-web'
  const slug = `${baseSlug}-${id.slice(0, 6)}`
  const selected = getTemplate(template === 'blank' ? 'studio' : template)
  if (!selected) throw new Error('Plantilla no disponible.')
  const sections = template === 'blank'
    ? selected.sections.filter(section => ['hero', 'contact'].includes(section.blockType))
    : selected.sections
  const document = migrateDocument({
    familyId: selected.familyId,
    templateId: selected.id,
    settings: { ...structuredClone(selected.settings), brand: name, seoTitle: name },
    sections: structuredClone(sections).map(section => ({ ...section, id: randomUUID() })),
  })
  db().prepare('INSERT INTO sites (id, owner_id, name, slug, draft, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, owner, name, slug, JSON.stringify(document), new Date().toISOString())
  return id
}

export function saveDocument(id: string, owner: string, document: SiteDocument, publish: boolean) {
  const serialized = JSON.stringify(document)
  const now = new Date().toISOString()
  if (publish) {
    db().prepare('UPDATE sites SET draft = ?, published = ?, updated_at = ?, published_at = ? WHERE id = ? AND owner_id = ?')
      .run(serialized, serialized, now, now, id, owner)
  } else {
    db().prepare('UPDATE sites SET draft = ?, updated_at = ? WHERE id = ? AND owner_id = ?')
      .run(serialized, now, id, owner)
  }
  return now
}

export function removePublication(id: string, owner: string) {
  db().prepare('UPDATE sites SET published = NULL, published_at = NULL WHERE id = ? AND owner_id = ?').run(id, owner)
}

export function deleteSite(id: string, owner: string) {
  const result = db().prepare('DELETE FROM sites WHERE id = ? AND owner_id = ?').run(id, owner)
  return result.changes > 0
}
