import 'server-only'
import { randomUUID } from 'node:crypto'
import { postgresQuery, withPostgresTransaction } from '@/server/db/postgres'

export type Lead = { id: string; siteId: string; siteName: string; siteSlug: string; kind: 'contact' | 'newsletter'; formId: string; values: Record<string, string>; createdAt: string; readAt: string | null }

function deserializeValues(value: unknown): Record<string, string> {
  if (typeof value === 'string') {
    try { value = JSON.parse(value) } catch { return {} }
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string'))
}

export async function consumeLeadRateLimit(bucket: string, limit: number, windowMs: number) {
  if (!bucket || !Number.isSafeInteger(limit) || limit < 1 || !Number.isSafeInteger(windowMs) || windowMs < 1) return false
  const result = await postgresQuery<{ bucket: string }>(`
    INSERT INTO platform_lead_rate_limits (bucket, window_start, count)
    VALUES ($1, NOW(), 1)
    ON CONFLICT (bucket) DO UPDATE SET
      window_start = CASE WHEN NOW() - platform_lead_rate_limits.window_start >= ($2 * INTERVAL '1 millisecond') THEN NOW() ELSE platform_lead_rate_limits.window_start END,
      count = CASE WHEN NOW() - platform_lead_rate_limits.window_start >= ($2 * INTERVAL '1 millisecond') THEN 1 ELSE platform_lead_rate_limits.count + 1 END
    WHERE NOW() - platform_lead_rate_limits.window_start >= ($2 * INTERVAL '1 millisecond') OR platform_lead_rate_limits.count < $3
    RETURNING bucket
  `, [bucket, windowMs, limit])
  return result.rowCount === 1
}

export async function saveLead(siteId: string, kind: 'contact' | 'newsletter', formId: string, values: Record<string, string>) {
  const id = randomUUID()
  await withPostgresTransaction(async client => {
    const siteResult = await client.query<{ owner_id: string }>('SELECT owner_id FROM platform_sites WHERE id = $1', [siteId])
    const site = siteResult.rows[0]
    if (!site) throw new Error('Sitio no encontrado.')
    await client.query('INSERT INTO platform_leads (id, site_id, kind, form_id, values, created_at) VALUES ($1, $2, $3, $4, $5::jsonb, $6)', [id, siteId, kind, formId, JSON.stringify(values), new Date()])
    await client.query('INSERT INTO platform_lead_notifications (id, lead_id, owner_id) VALUES ($1, $2, $3)', [randomUUID(), id, site.owner_id])
  })
}

export async function listLeads(ownerId: string) {
  const result = await postgresQuery(`SELECT leads.id, leads.site_id, sites.name AS site_name, sites.slug AS site_slug,
    leads.kind, leads.form_id, leads.values, leads.created_at, notifications.read_at
    FROM platform_leads leads JOIN platform_sites sites ON sites.id = leads.site_id
    JOIN platform_lead_notifications notifications ON notifications.lead_id = leads.id
    WHERE notifications.owner_id = $1 ORDER BY leads.created_at DESC`, [ownerId])
  return result.rows.map(row => ({
    id: row.id as string, siteId: row.site_id as string, siteName: row.site_name as string, siteSlug: row.site_slug as string,
    kind: row.kind as Lead['kind'], formId: row.form_id as string, values: deserializeValues(row.values),
    createdAt: new Date(row.created_at as string | Date).toISOString(),
    readAt: row.read_at ? new Date(row.read_at as string | Date).toISOString() : null,
  }))
}

export async function unreadLeadCount(ownerId: string) {
  const result = await postgresQuery<{ count: string }>('SELECT COUNT(*)::text AS count FROM platform_lead_notifications WHERE owner_id = $1 AND read_at IS NULL', [ownerId])
  return Number(result.rows[0]?.count || 0)
}

export async function markLeadsRead(ownerId: string) {
  await postgresQuery('UPDATE platform_lead_notifications SET read_at = NOW() WHERE owner_id = $1 AND read_at IS NULL', [ownerId])
}
