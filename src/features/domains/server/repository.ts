import 'server-only'
import { randomUUID } from 'node:crypto'
import { db } from '@/server/db/sqlite'
import { assertCanUseCustomDomain, getEntitlements } from '@/features/billing/server/access'
import { normalizeHostname } from '../validation'

export function createDomain(siteId: string, hostname: string) {
  const normalized = normalizeHostname(hostname)
  if (!normalized) throw new Error('Hostname inválido.')
  const site = db().prepare('SELECT owner_id FROM sites WHERE id = ?').get(siteId) as { owner_id: string } | undefined
  if (!site) throw new Error('Sitio inexistente.')
  assertCanUseCustomDomain(site.owner_id)
  const now = new Date().toISOString()
  const token = randomUUID().replace(/-/g, '')
  const id = randomUUID()
  db().prepare(`INSERT INTO domains (id, site_id, hostname, verification_token, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'pending', ?, ?)`).run(id, siteId, normalized, token, now, now)
  return db().prepare('SELECT * FROM domains WHERE id = ?').get(id)
}

export function findDomain(id: string) {
  return db().prepare('SELECT * FROM domains WHERE id = ?').get(id) as { id: string; site_id: string; hostname: string; verification_token: string; status: string } | undefined
}

export function isVerifiedHostname(hostname: string) {
  const normalized = normalizeHostname(hostname)
  if (!normalized) return false
  const row = db().prepare(`SELECT domains.id, sites.owner_id FROM domains
    INNER JOIN sites ON sites.id = domains.site_id
    WHERE domains.hostname = ? AND domains.status IN ('verified', 'active')`).get(normalized) as { id: string; owner_id: string } | undefined
  if (!row) return false
  const entitlements = getEntitlements(row.owner_id)
  return entitlements.plan.customDomain && entitlements.canEdit
}

export function listDomainsForOwner(ownerId: string) {
  return db().prepare(`SELECT domains.*, sites.name AS site_name FROM domains
    INNER JOIN sites ON sites.id = domains.site_id WHERE sites.owner_id = ? ORDER BY domains.created_at DESC`).all(ownerId) as { id: string; site_id: string; site_name: string; hostname: string; verification_token: string; status: string }[]
}

export function markDomainVerified(id: string) {
  const now = new Date().toISOString()
  const result = db().prepare("UPDATE domains SET status = 'verified', verified_at = COALESCE(verified_at, ?), updated_at = ? WHERE id = ? AND status = 'pending'").run(now, now, id)
  if (result.changes > 0) return true
  return findDomain(id)?.status === 'verified'
}
