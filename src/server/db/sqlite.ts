import 'server-only'
import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

let database: DatabaseSync | undefined

export function dataDirectory() {
  return process.env.PLATFORM_DATA_DIR || path.join(process.cwd(), 'data')
}

/** Shared local connection. Repositories own queries; routes never access SQL. */
export function db() {
  if (database) return database

  const directory = dataDirectory()
  mkdirSync(directory, { recursive: true })
  database = new DatabaseSync(path.join(directory, 'platform.sqlite'))
  database.exec(`
    PRAGMA journal_mode=WAL;
    PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'user'
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sites (
      id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES users(id), name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL, draft TEXT NOT NULL, published TEXT,
      updated_at TEXT NOT NULL, published_at TEXT
    );
    CREATE INDEX IF NOT EXISTS sites_owner ON sites(owner_id);
    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS media_owner ON media(owner_id);
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY, site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
      kind TEXT NOT NULL, form_id TEXT NOT NULL, values_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS leads_site ON leads(site_id, created_at);
    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, price_cents INTEGER NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'ARS', interval TEXT NOT NULL DEFAULT 'month',
      site_limit INTEGER NOT NULL, storage_limit_mb INTEGER NOT NULL, custom_domain INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY, user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan_id TEXT NOT NULL REFERENCES plans(id), status TEXT NOT NULL DEFAULT 'active',
      provider TEXT NOT NULL DEFAULT 'manual', provider_customer_id TEXT, provider_subscription_id TEXT,
      current_period_end TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS subscriptions_plan ON subscriptions(plan_id, status);
    CREATE TABLE IF NOT EXISTS lead_notifications (
      id TEXT PRIMARY KEY, lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      read_at TEXT
    );
    CREATE INDEX IF NOT EXISTS lead_notifications_owner ON lead_notifications(owner_id, read_at);
    CREATE TABLE IF NOT EXISTS lead_rate_limits (
      bucket TEXT PRIMARY KEY, window_start INTEGER NOT NULL, count INTEGER NOT NULL
    );
    INSERT INTO lead_notifications (id, lead_id, owner_id)
      SELECT lower(hex(randomblob(16))), leads.id, sites.owner_id
      FROM leads JOIN sites ON sites.id = leads.site_id
      LEFT JOIN lead_notifications ON lead_notifications.lead_id = leads.id
      WHERE lead_notifications.id IS NULL;
  `)
  const userColumns = database.prepare('PRAGMA table_info(users)').all() as { name: string }[]
  if (!userColumns.some(column => column.name === 'role')) database.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'")
  database.exec(`
    INSERT OR IGNORE INTO plans (id, name, price_cents, currency, interval, site_limit, storage_limit_mb, custom_domain) VALUES
      ('free', 'Gratis', 0, 'ARS', 'month', 1, 250, 0),
      ('starter', 'Inicial', 9900, 'ARS', 'month', 3, 2048, 0),
      ('pro', 'Profesional', 24900, 'ARS', 'month', 10, 10240, 1);
    INSERT OR IGNORE INTO subscriptions (id, user_id, plan_id, status, provider, created_at, updated_at)
      SELECT lower(hex(randomblob(16))), users.id, 'free', 'active', 'manual', datetime('now'), datetime('now')
      FROM users LEFT JOIN subscriptions ON subscriptions.user_id = users.id
      WHERE subscriptions.id IS NULL;
  `)
  return database
}
