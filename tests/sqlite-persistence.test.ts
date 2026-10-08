import test from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const dataDirectory = mkdtempSync(path.join(tmpdir(), 'web-dinamica-db-'))
process.env.PLATFORM_DATA_DIR = dataDirectory

const { closeDatabase, db } = await import('../src/server/db/sqlite')
const { listSites } = await import('../src/features/sites/server/repository')
const { listLeads } = await import('../src/features/sites/server/leads')

test.after(() => {
  closeDatabase()
  rmSync(dataDirectory, { recursive: true, force: true })
})

test('migrates a partial legacy database without losing rows and records the core version', () => {
  const file = path.join(dataDirectory, 'platform.sqlite')
  const legacy = new DatabaseSync(file)
  legacy.exec(`
    CREATE TABLE schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
    INSERT INTO schema_migrations VALUES (1, '2026-01-01T00:00:00.000Z');
    INSERT INTO schema_migrations VALUES (2, '2026-01-01T00:00:00.000Z');
    CREATE TABLE users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL);
    INSERT INTO users VALUES ('user-1', 'Ana', 'ana@example.com', 'hash');
    CREATE TABLE plans (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, price_cents INTEGER NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'ARS', interval TEXT NOT NULL DEFAULT 'month',
      site_limit INTEGER NOT NULL, storage_limit_mb INTEGER NOT NULL, custom_domain INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE subscriptions (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), plan_id TEXT NOT NULL,
      status TEXT NOT NULL, provider TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
  `)
  legacy.close()

  const database = db()
  const user = database.prepare('SELECT id, name FROM users').get() as { id: string; name: string }
  assert.equal(user.id, 'user-1')
  assert.equal(user.name, 'Ana')
  assert.equal((database.prepare('SELECT version FROM schema_migrations WHERE version = 3').get() as { version: number }).version, 3)
  for (const table of ['sites', 'media', 'leads']) {
    assert.equal(database.prepare('SELECT 1 FROM sqlite_master WHERE type = ? AND name = ?').get('table', table) !== undefined, true)
  }

  closeDatabase()
  assert.doesNotThrow(() => db())
  assert.equal((db().prepare('SELECT COUNT(*) AS count FROM schema_migrations WHERE version = 3').get() as { count: number }).count, 1)
})

test('does not throw when site or lead JSON is corrupt', () => {
  const database = db()
  database.prepare('INSERT INTO sites (id, owner_id, name, slug, draft, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run('bad-site', 'user-1', 'Bad', 'bad', '{broken', new Date().toISOString())
  database.prepare('INSERT INTO sites (id, owner_id, name, slug, draft, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run('lead-site', 'user-1', 'Leads', 'leads', JSON.stringify({ settings: {}, sections: [] }), new Date().toISOString())
  database.prepare('INSERT INTO leads (id, site_id, kind, form_id, values_json, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run('bad-lead', 'lead-site', 'contact', 'form', '{broken', new Date().toISOString())
  database.prepare('INSERT INTO lead_notifications (id, lead_id, owner_id) VALUES (?, ?, ?)')
    .run('notification-1', 'bad-lead', 'user-1')

  assert.doesNotThrow(() => listSites('user-1'))
  assert.equal(listSites('user-1').some(site => site.id === 'bad-site'), false)
  assert.deepEqual(listLeads('user-1')[0].values, {})
})
