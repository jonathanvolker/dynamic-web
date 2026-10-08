import 'server-only'
import { randomUUID } from 'node:crypto'
import { postgresQuery } from '@/server/db/postgres'
import { assertCanUseCustomDomain, getEntitlements } from '@/features/billing/server/access'
import { normalizeHostname } from '../validation'

export async function createDomain(siteId: string, hostname: string) {
  const normalized = normalizeHostname(hostname)
  if (!normalized) throw new Error('Hostname inválido.')
  const siteResult = await postgresQuery<{ owner_id: string }>('SELECT owner_id FROM platform_sites WHERE id = $1', [siteId])
  const ownerId = siteResult.rows[0]?.owner_id
  if (!ownerId) throw new Error('Sitio inexistente.')
  await assertCanUseCustomDomain(ownerId)
  const now = new Date().toISOString()
  const token = randomUUID().replace(/-/g, '')
  const id = randomUUID()
  const result = await postgresQuery(`INSERT INTO platform_domains (id, site_id, hostname, verification_token, status, created_at, updated_at)
    VALUES ($1, $2, $3, $4, 'pending', $5, $6) RETURNING *`, [id, siteId, normalized, token, now, now])
  return result.rows[0]
}

export async function findDomain(id: string) {
  const result = await postgresQuery('SELECT * FROM platform_domains WHERE id = $1', [id])
  return result.rows[0] as { id: string; site_id: string; hostname: string; verification_token: string; status: string } | undefined
}

export async function isVerifiedHostname(hostname: string) {
  const normalized = normalizeHostname(hostname)
  if (!normalized) return false
  const result = await postgresQuery<{ id: string; owner_id: string }>(`SELECT domains.id, sites.owner_id FROM platform_domains domains
    INNER JOIN platform_sites sites ON sites.id = domains.site_id
    WHERE domains.hostname = $1 AND domains.status IN ('verified', 'active')`, [normalized])
  const row = result.rows[0]
  if (!row) return false
  const entitlements = await getEntitlements(row.owner_id)
  return entitlements.plan.customDomain && entitlements.canEdit
}

export async function listDomainsForOwner(ownerId: string) {
  const result = await postgresQuery(`SELECT domains.*, sites.name AS site_name FROM platform_domains domains
    INNER JOIN platform_sites sites ON sites.id = domains.site_id WHERE sites.owner_id = $1 ORDER BY domains.created_at DESC`, [ownerId])
  return result.rows as { id: string; site_id: string; site_name: string; hostname: string; verification_token: string; status: string }[]
}

export async function markDomainVerified(id: string) {
  const now = new Date().toISOString()
  const result = await postgresQuery("UPDATE platform_domains SET status = 'verified', verified_at = COALESCE(verified_at, $1), updated_at = $2 WHERE id = $3 AND status = 'pending'", [now, now, id])
  if ((result.rowCount || 0) > 0) return true
  return (await findDomain(id))?.status === 'verified'
}
