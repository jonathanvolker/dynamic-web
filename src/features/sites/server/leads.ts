import 'server-only'
import { randomUUID } from 'node:crypto'
import { db } from '@/server/db/sqlite'

export function saveLead(siteId: string, kind: 'contact' | 'newsletter', formId: string, values: Record<string, string>) {
  db().prepare('INSERT INTO leads (id, site_id, kind, form_id, values_json, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(randomUUID(), siteId, kind, formId, JSON.stringify(values), new Date().toISOString())
}
