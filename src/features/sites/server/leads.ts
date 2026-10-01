import 'server-only'
import { randomUUID } from 'node:crypto'
import { db } from '@/server/db/sqlite'

export type Lead = { id: string; siteId: string; siteName: string; siteSlug: string; kind: 'contact' | 'newsletter'; formId: string; values: Record<string, string>; createdAt: string; readAt: string | null }

export function consumeLeadRateLimit(bucket: string, limit: number, windowMs: number) {
  const now = Date.now()
  const current = db().prepare('SELECT window_start, count FROM lead_rate_limits WHERE bucket = ?').get(bucket) as { window_start: number; count: number } | undefined
  if (!current || now - current.window_start >= windowMs) {
    db().prepare('INSERT INTO lead_rate_limits (bucket, window_start, count) VALUES (?, ?, 1) ON CONFLICT(bucket) DO UPDATE SET window_start = excluded.window_start, count = 1').run(bucket, now)
    return true
  }
  if (current.count >= limit) return false
  db().prepare('UPDATE lead_rate_limits SET count = count + 1 WHERE bucket = ?').run(bucket)
  return true
}

export function saveLead(siteId: string, kind: 'contact' | 'newsletter', formId: string, values: Record<string, string>) {
  const id = randomUUID()
  const site = db().prepare('SELECT owner_id FROM sites WHERE id = ?').get(siteId) as { owner_id: string } | undefined
  if (!site) throw new Error('Sitio no encontrado.')
  db().prepare('INSERT INTO leads (id, site_id, kind, form_id, values_json, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(id, siteId, kind, formId, JSON.stringify(values), new Date().toISOString())
  db().prepare('INSERT INTO lead_notifications (id, lead_id, owner_id) VALUES (?, ?, ?)').run(randomUUID(), id, site.owner_id)
}

export function listLeads(ownerId: string) {
  const rows = db().prepare(`SELECT leads.id, leads.site_id, sites.name AS site_name, sites.slug AS site_slug, leads.kind, leads.form_id, leads.values_json, leads.created_at, lead_notifications.read_at
    FROM leads JOIN sites ON sites.id = leads.site_id JOIN lead_notifications ON lead_notifications.lead_id = leads.id
    WHERE leads.site_id IN (SELECT id FROM sites WHERE owner_id = ?) ORDER BY leads.created_at DESC`).all(ownerId) as Record<string, unknown>[]
  return rows.map(row => ({ id: row.id as string, siteId: row.site_id as string, siteName: row.site_name as string, siteSlug: row.site_slug as string, kind: row.kind as Lead['kind'], formId: row.form_id as string, values: JSON.parse(row.values_json as string) as Record<string, string>, createdAt: row.created_at as string, readAt: row.read_at as string | null }))
}

export function unreadLeadCount(ownerId: string) {
  return (db().prepare('SELECT COUNT(*) AS count FROM lead_notifications WHERE owner_id = ? AND read_at IS NULL').get(ownerId) as { count: number }).count
}

export function markLeadsRead(ownerId: string) {
  db().prepare('UPDATE lead_notifications SET read_at = ? WHERE owner_id = ? AND read_at IS NULL').run(new Date().toISOString(), ownerId)
}
