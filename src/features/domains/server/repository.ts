import 'server-only'
import { randomUUID } from 'node:crypto'
import { db } from '@/server/db/sqlite'

export function createDomain(siteId: string, hostname: string) {
  const now = new Date().toISOString()
  const token = randomUUID().replace(/-/g, '')
  const id = randomUUID()
  db().prepare(`INSERT INTO domains (id, site_id, hostname, verification_token, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'pending', ?, ?)`).run(id, siteId, hostname, token, now, now)
  return db().prepare('SELECT * FROM domains WHERE id = ?').get(id)
}

export function findDomain(id: string) {
  return db().prepare('SELECT * FROM domains WHERE id = ?').get(id) as { id: string; site_id: string; hostname: string; verification_token: string; status: string } | undefined
}

export function isVerifiedHostname(hostname: string) {
  const row = db().prepare("SELECT id FROM domains WHERE hostname = ? AND status IN ('verified', 'active')").get(hostname.toLowerCase())
  return Boolean(row)
}

export function listDomainsForOwner(ownerId: string) {
  return db().prepare(`SELECT domains.*, sites.name AS site_name FROM domains
    INNER JOIN sites ON sites.id = domains.site_id WHERE sites.owner_id = ? ORDER BY domains.created_at DESC`).all(ownerId) as { id: string; site_id: string; site_name: string; hostname: string; verification_token: string; status: string }[]
}

export function markDomainVerified(id: string) {
  const now = new Date().toISOString()
  db().prepare("UPDATE domains SET status = 'verified', verified_at = ?, updated_at = ? WHERE id = ?").run(now, now, id)
}
