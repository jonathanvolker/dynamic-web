import 'server-only'
import { randomUUID } from 'node:crypto'
import { postgresQuery } from '@/server/db/postgres'
import { getTemplate } from '@/features/templates/registry'
import type { Site, SiteDocument } from '../types'
import { ensureFooter, migrateDocument } from '../document'

function deserialize(row: Record<string, unknown> | undefined): Site | null {
  if (!row) return null
  try {
    const json = (value: unknown) => typeof value === 'string' ? JSON.parse(value) : value
    return {
      ...row,
      updated_at: new Date(row.updated_at as string | Date).toISOString(),
      published_at: row.published_at ? new Date(row.published_at as string | Date).toISOString() : null,
      draft: migrateDocument(json(row.draft)),
      published: row.published ? migrateDocument(json(row.published)) : null,
    } as Site
  } catch {
    return null
  }
}

async function hasPublicEntitlement(ownerId: string, now = Date.now()) {
  const result = await postgresQuery<{ status: string; current_period_ends_at: string | Date; grace_period_ends_at: string | Date | null }>(`SELECT status, current_period_ends_at, grace_period_ends_at
    FROM platform_subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`, [ownerId])
  const subscription = result.rows[0]
  if (!subscription) return false
  if (subscription.status === 'trialing' || subscription.status === 'active') return new Date(subscription.current_period_ends_at).getTime() > now
  return subscription.status === 'past_due' && Boolean(subscription.grace_period_ends_at) && new Date(subscription.grace_period_ends_at || 0).getTime() > now
}

export async function listSites(owner: string) {
  const result = await postgresQuery('SELECT * FROM platform_sites WHERE owner_id = $1 ORDER BY updated_at DESC', [owner])
  return result.rows.map(row => deserialize(row as Record<string, unknown>)).filter((site): site is Site => site !== null)
}

export async function findSite(id: string, owner: string) {
  const result = await postgresQuery('SELECT * FROM platform_sites WHERE id = $1 AND owner_id = $2', [id, owner])
  return deserialize(result.rows[0] as Record<string, unknown> | undefined)
}

export async function publicSite(slug: string) {
  const result = await postgresQuery('SELECT * FROM platform_sites WHERE slug = $1 AND published IS NOT NULL', [slug])
  const row = result.rows[0] as Record<string, unknown> | undefined
  return row && await hasPublicEntitlement(String(row.owner_id)) ? deserialize(row) : null
}

export async function publicSiteByHostname(hostname: string) {
  const domainResult = await postgresQuery<{ site_id: string }>(`SELECT site_id FROM platform_domains
    WHERE hostname = $1 AND status IN ('verified', 'active')`, [hostname])
  const domain = domainResult.rows[0]
  if (!domain) return null
  const result = await postgresQuery('SELECT * FROM platform_sites WHERE id = $1 AND published IS NOT NULL', [domain.site_id])
  const row = result.rows[0] as Record<string, unknown> | undefined
  return row && await hasPublicEntitlement(String(row.owner_id)) ? deserialize(row) : null
}

export async function createSite(owner: string, name: string, template: string, allowedBlocks: string[] | 'all' = 'all') {
  const id = randomUUID()
  const baseSlug = name.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'mi-web'
  const slug = `${baseSlug}-${id.slice(0, 6)}`
  const selected = getTemplate(template === 'blank' ? 'studio' : template)
  if (!selected) throw new Error('Plantilla no disponible.')
  const sections = (template === 'blank'
    ? selected.sections.filter(section => ['hero', 'gallery'].includes(section.blockType))
    : selected.sections).filter(section => allowedBlocks === 'all' || allowedBlocks.includes(section.blockType))
  const document = ensureFooter(migrateDocument({
    familyId: selected.familyId,
    templateId: selected.id,
    settings: { ...structuredClone(selected.settings), brand: name, seoTitle: name },
    schemaVersion: 1,
    sections: structuredClone(sections).map(section => ({ ...section, id: randomUUID() })),
  }))
  await postgresQuery('INSERT INTO platform_sites (id, owner_id, name, slug, draft, updated_at) VALUES ($1, $2, $3, $4, $5::jsonb, $6)',
    [id, owner, name, slug, JSON.stringify(document), new Date().toISOString()])
  return id
}

export async function saveDocument(id: string, owner: string, document: SiteDocument, publish: boolean) {
  const serialized = JSON.stringify(document)
  const now = new Date().toISOString()
  if (publish) {
    await postgresQuery('UPDATE platform_sites SET draft = $1::jsonb, published = $1::jsonb, updated_at = $2, published_at = $2 WHERE id = $3 AND owner_id = $4', [serialized, now, id, owner])
  } else {
    await postgresQuery('UPDATE platform_sites SET draft = $1::jsonb, updated_at = $2 WHERE id = $3 AND owner_id = $4', [serialized, now, id, owner])
  }
  return now
}

export async function removePublication(id: string, owner: string) {
  await postgresQuery('UPDATE platform_sites SET published = NULL, published_at = NULL WHERE id = $1 AND owner_id = $2', [id, owner])
}

export async function deleteSite(id: string, owner: string) {
  const result = await postgresQuery('DELETE FROM platform_sites WHERE id = $1 AND owner_id = $2', [id, owner])
  return (result.rowCount || 0) > 0
}
